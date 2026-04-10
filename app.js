/**
 * 0xPh4nt0m CTF — Main Application Controller
 * Manages registration, layers, timed hints, scoreboard, and overall flow
 */

/* global CryptoUtils, PhantomEffects, PhantomTimer, HintSystem, PhantomScoreboard,
          Layer1, Layer2, Layer3, Layer4, PHANTOM_CONFIG */

const PhantomApp = {
    currentLayer: 1,
    totalLayers: 4,
    fragments: [],
    layers: [null, Layer1, Layer2, Layer3, Layer4],
    _isLocked: false,
    _savedAnswers: {},
    _hintInterval: null,

    STORAGE_KEY: '__\u03C8_progress',

    // ══════════════════════════════════════
    // INITIALIZATION
    // ══════════════════════════════════════

    async init() {
        // Initialize subsystems
        PhantomScoreboard.init();
        HintSystem.init();
        PhantomEffects.initCanvas('signal-canvas');

        // Check registration & one-time access
        const existingUser = PhantomScoreboard.getLocalUser();
        
        if (PhantomScoreboard.isCompleted()) {
            // Already completed — show completed screen
            this._showCompletedScreen(existingUser);
            return;
        }

        if (!existingUser) {
            // Not registered — show registration
            this._showRegistration();
            return;
        }

        // Registered but not completed — start/resume challenge
        this._startChallenge();
    },

    // ══════════════════════════════════════
    // REGISTRATION
    // ══════════════════════════════════════

    _showRegistration() {
        const overlay = document.getElementById('registration-overlay');
        if (overlay) overlay.classList.add('active');

        const form = document.getElementById('reg-form');
        const errorEl = document.getElementById('reg-error');

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                errorEl.textContent = '';
                errorEl.style.display = 'none';

                const alias = document.getElementById('reg-alias').value.trim();
                const fullName = document.getElementById('reg-fullname').value.trim();
                const affiliation = document.getElementById('reg-affiliation').value.trim();

                const submitBtn = document.getElementById('reg-submit');
                submitBtn.disabled = true;
                submitBtn.textContent = 'CONNECTING...';

                const result = await PhantomScoreboard.registerUser(alias, fullName, affiliation);

                if (result.success) {
                    overlay.classList.remove('active');
                    PhantomEffects.noiseBurst();
                    setTimeout(() => this._startChallenge(), 500);
                } else {
                    errorEl.textContent = result.error;
                    errorEl.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'INITIATE SIGNAL INTERCEPT';
                    PhantomEffects.shake();
                }
            });
        }
    },

    _showCompletedScreen(user) {
        const container = document.getElementById('layer-content');
        if (!container) return;
        
        // Hide registration overlay if visible
        const regOverlay = document.getElementById('registration-overlay');
        if (regOverlay) regOverlay.classList.remove('active');

        container.innerHTML = `
            <div class="terminal-panel">
                <div class="terminal-header">
                    <span class="terminal-dot"></span>
                    <span class="terminal-dot"></span>
                    <span class="terminal-dot"></span>
                    SESSION TERMINATED
                </div>
                <div class="terminal-body" style="text-align: center; padding: 40px;">
                    <div class="terminal-line"><span class="warn-msg" style="font-size: 1.2rem;">CHALLENGE ALREADY COMPLETED</span></div>
                    <div class="terminal-line" style="margin-top: 15px;">
                        Operative <span class="fragment-display">${user ? user.alias : 'UNKNOWN'}</span> has already breached the void gate.
                    </div>
                    <div class="terminal-line" style="margin-top: 10px; color: var(--text-dim);">
                        This terminal session is sealed. One signal per operative.
                    </div>
                    <div class="terminal-line" style="margin-top: 25px;">
                        <button class="submit-btn" id="show-scoreboard-btn" style="padding: 10px 25px;">
                            VIEW SCOREBOARD
                        </button>
                    </div>
                </div>
            </div>
            <div id="scoreboard-panel" class="scoreboard-panel" style="margin-top: 20px;"></div>
        `;

        document.getElementById('show-scoreboard-btn')?.addEventListener('click', async () => {
            const panel = document.getElementById('scoreboard-panel');
            panel.style.display = 'block';
            await PhantomScoreboard.renderScoreboard(panel);
        });

        // Init timer display to show 00:00:00
        const timerEl = document.getElementById('timer-display');
        if (timerEl) {
            timerEl.textContent = '00:00:00';
            timerEl.classList.add('critical');
        }
    },

    // ══════════════════════════════════════
    // CHALLENGE FLOW
    // ══════════════════════════════════════

    _startChallenge() {
        // Restore progress
        this._restoreProgress();

        // Initialize timer
        PhantomTimer.init(
            (time) => this._onTimerTick(time),
            () => this._onTimerExpire()
        );

        // Render current layer
        this._renderCurrentLayer();
        this._updateProgressUI();
        this._startHintTimer();

        // Show user alias in header
        const user = PhantomScoreboard.getLocalUser();
        const aliasEl = document.getElementById('user-alias-display');
        if (aliasEl && user) {
            aliasEl.textContent = user.alias;
            aliasEl.style.display = 'inline';
        }
    },

    /**
     * Called by layer modules when answer is correct
     */
    advanceLayer(fragment) {
        if (this._isLocked) return;

        this.fragments.push(fragment);
        sessionStorage.setItem(`__f${this.currentLayer}`, fragment);

        // Persist the layer answer
        const layerAnswer = sessionStorage.getItem(`__l${this.currentLayer}_key`);
        if (layerAnswer) {
            this._savedAnswers[this.currentLayer] = layerAnswer;
        }

        if (this.currentLayer < this.totalLayers) {
            this.currentLayer++;
            this._saveProgress();

            PhantomEffects.noiseBurst();

            setTimeout(() => {
                this._renderCurrentLayer();
                this._updateProgressUI();
                this._startHintTimer();
            }, 500);
        }
    },

    /**
     * Called by Layer 4 when flag is assembled
     */
    async onChallengeComplete() {
        const elapsed = PhantomTimer.DURATION_MS - PhantomTimer.getRemainingMs();
        const result = await PhantomScoreboard.submitCompletion(elapsed);

        if (result && result.isFirstBlood) {
            this._showFirstBlood();
        }

        PhantomTimer.stop();
    },

    // ══════════════════════════════════════
    // HINTS (time-based auto-reveal)
    // ══════════════════════════════════════

    _startHintTimer() {
        // Clear existing interval
        if (this._hintInterval) clearInterval(this._hintInterval);

        const layerKey = `layer${this.currentLayer}`;
        HintSystem.enterLayer(layerKey);

        // Update hints every 5 seconds
        this._renderHints();
        this._hintInterval = setInterval(() => this._renderHints(), 5000);
    },

    _renderHints() {
        const layerKey = `layer${this.currentLayer}`;
        const hintsContainer = document.getElementById(`${layerKey}-hints`);
        const hintReveal = document.getElementById(`${layerKey}-hint-reveal`);

        if (!hintsContainer) return;

        const hints = HintSystem.getHints(layerKey);
        hintsContainer.innerHTML = '';

        hints.forEach((hint, idx) => {
            const btn = document.createElement('button');
            
            if (hint.available) {
                btn.className = 'hint-btn unlocked';
                btn.textContent = `HINT ${idx + 1}`;
                
                // Pulse animation if newly available and not yet viewed
                if (!hint.revealed) {
                    btn.classList.add('hint-new');
                }

                btn.addEventListener('click', () => {
                    HintSystem.revealHint(layerKey, idx);
                    if (hintReveal) {
                        hintReveal.textContent = `[SIGNAL FRAGMENT ${idx + 1}] ${hint.text}`;
                        hintReveal.classList.add('visible');
                    }
                    btn.classList.remove('hint-new');
                });
            } else {
                btn.className = 'hint-btn locked';
                const countdown = HintSystem.formatCountdown(hint.timeUntilMs);
                btn.textContent = `HINT ${idx + 1} [${countdown}]`;
                btn.disabled = true;
            }

            hintsContainer.appendChild(btn);
        });
    },

    // ══════════════════════════════════════
    // UI RENDERING
    // ══════════════════════════════════════

    _renderCurrentLayer() {
        const container = document.getElementById('layer-content');
        if (!container) return;

        const layer = this.layers[this.currentLayer];
        if (!layer) return;

        if (this.currentLayer === 4) {
            layer.render(container, this.fragments);
        } else {
            layer.render(container);
        }

        const nameEl = document.getElementById('current-layer-name');
        if (nameEl) nameEl.textContent = layer.name;
    },

    _updateProgressUI() {
        for (let i = 1; i <= this.totalLayers; i++) {
            const dot = document.getElementById(`progress-dot-${i}`);
            if (!dot) continue;
            dot.classList.remove('active', 'completed');
            if (i < this.currentLayer) dot.classList.add('completed');
            else if (i === this.currentLayer) dot.classList.add('active');
        }

        const percentage = ((this.currentLayer - 1) / this.totalLayers) * 100;
        const fill = document.getElementById('signal-fill');
        const pctText = document.getElementById('signal-pct');
        if (fill) fill.style.width = percentage + '%';
        if (pctText) pctText.textContent = Math.round(percentage) + '%';
    },

    _showFirstBlood() {
        const banner = document.createElement('div');
        banner.className = 'first-blood-banner';
        banner.innerHTML = `
            <div class="first-blood-icon">⚡</div>
            <div class="first-blood-text">FIRST BLOOD</div>
            <div class="first-blood-sub">You are the first operative to breach the void gate</div>
        `;
        document.body.appendChild(banner);
        setTimeout(() => banner.classList.add('visible'), 100);
        setTimeout(() => { banner.classList.remove('visible'); setTimeout(() => banner.remove(), 500); }, 6000);
    },

    // ══════════════════════════════════════
    // TIMER
    // ══════════════════════════════════════

    _onTimerTick(time) {
        const timerEl = document.getElementById('timer-display');
        if (!timerEl) return;

        timerEl.textContent = PhantomTimer.formatDisplay();
        timerEl.classList.remove('warning', 'critical');
        if (time.percentage < 10) timerEl.classList.add('critical');
        else if (time.percentage < 25) timerEl.classList.add('warning');
    },

    _onTimerExpire() {
        this._isLocked = true;
        const overlay = document.getElementById('game-over-overlay');
        if (overlay) overlay.classList.add('active');
        document.querySelectorAll('.input-field, .submit-btn, .hint-btn').forEach(el => {
            el.disabled = true;
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.3';
        });
    },

    // ══════════════════════════════════════
    // STATE PERSISTENCE
    // ══════════════════════════════════════

    _saveProgress() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
                currentLayer: this.currentLayer,
                fragments: this.fragments,
                answers: this._savedAnswers
            }));
        } catch (e) { console.error('Save progress error:', e); }
    },

    _restoreProgress() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const state = JSON.parse(saved);
                if (state.currentLayer && state.currentLayer > 1) {
                    this.currentLayer = state.currentLayer;
                    this.fragments = state.fragments || [];
                    this._savedAnswers = state.answers || {};

                    this.fragments.forEach((f, i) => {
                        sessionStorage.setItem(`__f${i + 1}`, f);
                    });
                    for (const [num, answer] of Object.entries(this._savedAnswers)) {
                        sessionStorage.setItem(`__l${num}_key`, answer);
                    }
                }
            }
        } catch (e) { console.error('Restore progress error:', e); }
    }
};

// Expose on window for layer module callbacks
window.PhantomApp = PhantomApp;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    PhantomApp.init();
});
