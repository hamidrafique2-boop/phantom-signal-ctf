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

    // ──────────────────────────────────────
    // REGISTRATION WHITELIST
    // Update this map with the actual student roster before deployment.
    // Keys are Registration IDs (must match email prefix: {regId}@students.au.edu.pk).
    // ──────────────────────────────────────
    _WHITELIST: {
        // Group A
        'au-bscs-f21-001': { name: 'Hamid Rafique',        group: 'A' },
        'au-bscs-f21-002': { name: 'Ahmed Ali',             group: 'A' },
        'au-bscs-f21-003': { name: 'Usman Khan',            group: 'A' },
        'au-bscs-f21-004': { name: 'Bilal Hassan',          group: 'A' },
        'au-bscs-f21-005': { name: 'Faisal Mahmood',        group: 'A' },
        'au-bscs-f21-006': { name: 'Saad Iqbal',            group: 'A' },
        'au-bscs-f21-007': { name: 'Zain Ul Abidin',        group: 'A' },
        'au-bscs-f21-008': { name: 'Omar Farooq',           group: 'A' },
        'au-bscs-f21-009': { name: 'Talha Mehmood',         group: 'A' },
        'au-bscs-f21-010': { name: 'Shahzaib Ahmed',        group: 'A' },
        'au-bscs-f21-011': { name: 'Asad Raza',             group: 'A' },
        'au-bscs-f21-012': { name: 'Haris Nawaz',           group: 'A' },
        'au-bscs-f21-013': { name: 'Muneeb Ur Rahman',      group: 'A' },
        'au-bscs-f21-014': { name: 'Danyal Sheikh',         group: 'A' },
        'au-bscs-f21-015': { name: 'Hamza Tariq',           group: 'A' },
        'au-bscs-f21-016': { name: 'Aqib Javed',            group: 'A' },
        'au-bscs-f21-017': { name: 'Waqar Hussain',         group: 'A' },
        'au-bscs-f21-018': { name: 'Nasir Mahmood',         group: 'A' },
        'au-bscs-f21-019': { name: 'Farhan Aziz',           group: 'A' },
        'au-bscs-f21-020': { name: 'Taimoor Baig',          group: 'A' },
        // Group B
        'au-bscs-f21-021': { name: 'Kamran Siddiqui',       group: 'B' },
        'au-bscs-f21-022': { name: 'Irfan Ullah',           group: 'B' },
        'au-bscs-f21-023': { name: 'Sohaib Anwar',          group: 'B' },
        'au-bscs-f21-024': { name: 'Junaid Khalid',         group: 'B' },
        'au-bscs-f21-025': { name: 'Rizwan Ghafoor',        group: 'B' },
        'au-bscs-f21-026': { name: 'Adeel Bukhari',         group: 'B' },
        'au-bscs-f21-027': { name: 'Salman Niaz',           group: 'B' },
        'au-bscs-f21-028': { name: 'Imran Chaudhry',        group: 'B' },
        'au-bscs-f21-029': { name: 'Qasim Rauf',            group: 'B' },
        'au-bscs-f21-030': { name: 'Naveed Akhtar',         group: 'B' },
        'au-bscs-f21-031': { name: 'Rehan Babar',           group: 'B' },
        'au-bscs-f21-032': { name: 'Shahid Pervaiz',        group: 'B' },
        'au-bscs-f21-033': { name: 'Waseem Akram',          group: 'B' },
        'au-bscs-f21-034': { name: 'Noman Aslam',           group: 'B' },
        'au-bscs-f21-035': { name: 'Yasir Latif',           group: 'B' },
        'au-bscs-f21-036': { name: 'Zubair Qadir',          group: 'B' },
        'au-bscs-f21-037': { name: 'Fahad Mirza',           group: 'B' },
        'au-bscs-f21-038': { name: 'Awais Hafeez',          group: 'B' },
        'au-bscs-f21-039': { name: 'Naeem Sadiq',           group: 'B' },
        'au-bscs-f21-040': { name: 'Khurram Shehzad',       group: 'B' },
        // Group C
        'au-bscs-f21-041': { name: 'Tariq Nawaz',           group: 'C' },
        'au-bscs-f21-042': { name: 'Abrar Hussain',         group: 'C' },
        'au-bscs-f21-043': { name: 'Javed Iqbal',           group: 'C' },
        'au-bscs-f21-044': { name: 'Shehryar Malik',        group: 'C' },
        'au-bscs-f21-045': { name: 'Zahid Mehmood',         group: 'C' },
        'au-bscs-f21-046': { name: 'Raza Ul Haq',           group: 'C' },
        'au-bscs-f21-047': { name: 'Babar Azam',            group: 'C' },
        'au-bscs-f21-048': { name: 'Shahbaz Gill',          group: 'C' },
        'au-bscs-f21-049': { name: 'Mohsin Naqvi',          group: 'C' },
        'au-bscs-f21-050': { name: 'Arshad Waheed',         group: 'C' },
        'au-bscs-f21-051': { name: 'Farrukh Tashkentov',    group: 'C' },
        'au-bscs-f21-052': { name: 'Ghulam Mustafa',        group: 'C' },
        'au-bscs-f21-053': { name: 'Habib Ur Rahman',       group: 'C' },
        'au-bscs-f21-054': { name: 'Imtiaz Ahmad',          group: 'C' },
        'au-bscs-f21-055': { name: 'Khalid Mehmood',        group: 'C' },
        'au-bscs-f21-056': { name: 'Liaquat Ali',           group: 'C' },
        'au-bscs-f21-057': { name: 'Muzammil Hussain',      group: 'C' },
        'au-bscs-f21-058': { name: 'Naseem Akhtar',         group: 'C' },
        'au-bscs-f21-059': { name: 'Pervaiz Bashir',        group: 'C' },
        'au-bscs-f21-060': { name: 'Qaiser Mahmood',        group: 'C' }
    },

    _showRegistration() {
        const overlay = document.getElementById('registration-overlay');
        if (overlay) overlay.classList.add('active');

        // Support both old form id (#reg-form) and new form id (#registration-form)
        const form = document.getElementById('reg-form') || document.getElementById('registration-form');
        if (!form) return;

        // Ensure error element exists
        let errorEl = document.getElementById('reg-error');
        if (!errorEl) {
            errorEl = document.createElement('p');
            errorEl.id = 'reg-error';
            errorEl.className = 'error-msg';
            errorEl.style.cssText = 'display:none;color:#ff0040;margin-top:8px;font-size:0.85rem;';
            form.appendChild(errorEl);
        }

        // Identity-confirmation element (already in index.html; create if absent)
        let identityEl = document.getElementById('identity-confirmation');
        if (!identityEl) {
            identityEl = document.createElement('p');
            identityEl.id = 'identity-confirmation';
            identityEl.className = 'reg-identity-confirmation';
            identityEl.style.display = 'none';
            const regIdInput = document.getElementById('reg-regid');
            if (regIdInput && regIdInput.parentNode) {
                regIdInput.parentNode.insertBefore(identityEl, regIdInput.nextSibling);
            } else {
                form.insertBefore(identityEl, form.firstChild.nextSibling);
            }
        }

        // Live identity confirmation as user types regId
        const regIdInput = document.getElementById('reg-regid');
        if (regIdInput) {
            regIdInput.addEventListener('input', () => {
                const regId = regIdInput.value.trim().toLowerCase();
                const entry = this._WHITELIST[regId];
                if (entry) {
                    identityEl.textContent = `\u2713 Identity confirmed: ${entry.name}`;
                    identityEl.className = 'reg-identity-confirmation confirmed';
                    identityEl.style.display = 'block';
                } else {
                    identityEl.textContent = '';
                    identityEl.style.display = 'none';
                }
            });
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorEl.textContent = '';
            errorEl.style.display = 'none';

            const regId = document.getElementById('reg-regid')
                ? document.getElementById('reg-regid').value.trim().toLowerCase()
                : '';
            const email = document.getElementById('reg-email')
                ? document.getElementById('reg-email').value.trim().toLowerCase()
                : '';
            // alias and affiliation — derive from regId / whitelist when not present in form
            const aliasInput = document.getElementById('reg-alias');
            const affiliationInput = document.getElementById('reg-affiliation');
            const alias = aliasInput ? aliasInput.value.trim() : regId.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
            const affiliation = affiliationInput ? affiliationInput.value.trim() : 'Air University';

            const submitBtn = form.querySelector('[type=submit]') || document.getElementById('reg-submit');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'CONNECTING...';
            }

            const showError = (msg) => {
                errorEl.textContent = msg;
                errorEl.style.display = 'block';
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'INITIATE SIGNAL INTERCEPT';
                }
                if (typeof PhantomEffects !== 'undefined') PhantomEffects.shake();
            };

            // 1. Validate regId against whitelist
            const whitelistEntry = this._WHITELIST[regId];
            if (!whitelistEntry) {
                showError('INVALID CREDENTIALS \u2014 ACCESS DENIED');
                return;
            }

            // 2. Validate email format
            const expectedEmail = `${regId}@students.au.edu.pk`;
            if (email !== expectedEmail) {
                showError('INVALID CREDENTIALS \u2014 ACCESS DENIED');
                return;
            }

            // 3. Validate alias
            const cleanAlias = alias.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
            if (cleanAlias.length < 2) {
                showError('INVALID CREDENTIALS \u2014 ACCESS DENIED');
                return;
            }

            // 4. Firebase checks (duplicate + revoked)
            if (PhantomScoreboard._isFirebaseReady && PhantomScoreboard.db) {
                try {
                    const snapshot = await PhantomScoreboard.db.ref(`registrations/${regId}`).once('value');
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        if (data && data.revoked === true) {
                            showError('ACCESS SUSPENDED \u2014 CONTACT ADMIN TO RESTORE YOUR SESSION.');
                        } else {
                            showError('TERMINAL LOCKED \u2014 THIS IDENTITY HAS ALREADY INITIATED A SESSION. CONTACT ADMIN TO REQUEST ACCESS.');
                        }
                        return;
                    }
                } catch (fbErr) {
                    console.warn('[App] Firebase pre-check failed:', fbErr.message);
                }
            }

            // 5. Write to Firebase
            const userData = {
                name: whitelistEntry.name,
                alias: cleanAlias,
                email: email,
                affiliation: affiliation,
                group: whitelistEntry.group,
                revoked: false,
                registeredAt: firebase && firebase.database
                    ? firebase.database.ServerValue.TIMESTAMP
                    : Date.now(),
                registrationId: regId
            };

            if (PhantomScoreboard._isFirebaseReady && PhantomScoreboard.db) {
                try {
                    await PhantomScoreboard.db.ref(`registrations/${regId}`).set(userData);
                } catch (fbErr) {
                    console.warn('[App] Firebase write failed, continuing locally:', fbErr.message);
                }
            }

            // 6. Store locally (use same key PhantomScoreboard reads)
            const localUser = {
                alias: cleanAlias,
                fullName: whitelistEntry.name,
                email: email,
                affiliation: affiliation,
                regId: regId,
                registeredAt: Date.now()
            };
            localStorage.setItem(PhantomScoreboard.STORAGE_KEY, JSON.stringify(localUser));
            PhantomScoreboard._currentUser = localUser;

            // 7. Proceed
            if (overlay) overlay.classList.remove('active');
            if (typeof PhantomEffects !== 'undefined') PhantomEffects.noiseBurst();
            setTimeout(() => this._startChallenge(), 500);
        });
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
