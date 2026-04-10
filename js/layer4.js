/**
 * 0xPh4nt0m CTF — Layer 4: The Void Gate
 * Final assembly + scoreboard submission + first blood
 */

const Layer4 = {
    id: 'layer4',
    name: 'THE VOID GATE',

    render(container, fragments) {
        container.innerHTML = `
            <div class="terminal-panel">
                <div class="terminal-header">
                    <span class="terminal-dot"></span>
                    <span class="terminal-dot"></span>
                    <span class="terminal-dot"></span>
                    VOID GATE — FINAL ASSEMBLY
                </div>
                <div class="terminal-body" id="layer4-terminal">
                    <div class="terminal-line"><span class="prompt">$</span><span class="success-msg"> ALL THREE PROTOCOL LAYERS BREACHED</span></div>
                    <div class="terminal-line"><span class="prompt">$</span><span class="sys-msg"> the void gate responds to your signal</span></div>
                    <div class="terminal-line"><span class="prompt">$</span><span class="sys-msg"> assembling fragments...</span></div>
                    <div class="terminal-line">&nbsp;</div>
                    <div class="terminal-line">The void gate stands before you. Three fragments of the</div>
                    <div class="terminal-line">phantom's true signal have been recovered. The fourth lies</div>
                    <div class="terminal-line">beyond, locked by a master key forged from the combined</div>
                    <div class="terminal-line">knowledge of all your discoveries.</div>
                    <div class="terminal-line">&nbsp;</div>
                    <div class="terminal-line">Recovered signal fragments:</div>
                    <div class="terminal-line"><span class="prompt">F1:</span> <span class="fragment-display">${fragments[0] || '???'}</span></div>
                    <div class="terminal-line"><span class="prompt">F2:</span> <span class="fragment-display">${fragments[1] || '???'}</span></div>
                    <div class="terminal-line"><span class="prompt">F3:</span> <span class="fragment-display">${fragments[2] || '???'}</span></div>
                    <div class="terminal-line"><span class="prompt">F4:</span> <span class="fragment-display" id="f4-display">[ ENCRYPTED — REQUIRES MASTER KEY ]</span></div>
                </div>
            </div>

            <div class="void-gate">
                <div class="void-portal" id="void-portal"></div>
                <div id="layer4-status" style="margin-bottom: 20px;"></div>
                <button class="submit-btn" id="layer4-assemble" style="font-size: 0.9rem; padding: 12px 30px; letter-spacing: 3px;">
                    OPEN THE VOID GATE
                </button>
            </div>

            <div id="flag-container"></div>

            <div class="hints-container" id="layer4-hints"></div>
            <div id="layer4-hint-reveal" class="hint-reveal"></div>

            <div id="scoreboard-panel" class="scoreboard-panel" style="margin-top: 30px; display: none;"></div>
        `;

        document.getElementById('layer4-assemble').addEventListener('click', () => this._assemble());
    },

    async _assemble() {
        const statusEl = document.getElementById('layer4-status');
        const btn = document.getElementById('layer4-assemble');
        btn.disabled = true;
        btn.textContent = 'ASSEMBLING...';

        statusEl.innerHTML = '<div class="status-msg info">Deriving master key from all layer solutions...</div>';

        try {
            const l1 = sessionStorage.getItem('__l1_key');
            const l2 = sessionStorage.getItem('__l2_key');
            const l3 = sessionStorage.getItem('__l3_key');

            if (!l1 || !l2 || !l3) {
                statusEl.innerHTML = '<div class="status-msg error">ERROR: Missing layer solutions. All three layers must be solved in this session.</div>';
                btn.disabled = false;
                btn.textContent = 'OPEN THE VOID GATE';
                PhantomEffects.shake();
                return;
            }

            const masterInput = `${l1}:${l2}:${l3}`;
            const masterKeyHex = await CryptoUtils.sha256(masterInput);

            const f4Data = await fetch('fragments/f4.json').then(r => r.json());
            const fragment4 = await CryptoUtils.decryptFragmentWithRawKey(masterKeyHex, f4Data);

            document.getElementById('f4-display').textContent = fragment4;
            document.getElementById('f4-display').style.color = '#00ff41';

            const allFragments = [
                sessionStorage.getItem('__f1'),
                sessionStorage.getItem('__f2'),
                sessionStorage.getItem('__f3'),
                fragment4
            ];

            const flag = `0xPh4nt0m{${allFragments.join('')}}`;

            statusEl.innerHTML = '<div class="status-msg success">VOID GATE OPENED — The phantom\'s true signal has been reconstructed.</div>';

            PhantomEffects.noiseBurst();

            // Submit to scoreboard
            if (window.PhantomApp) {
                window.PhantomApp.onChallengeComplete();
            }

            setTimeout(() => {
                this._revealFlag(flag);
            }, 1000);

            PhantomTimer.stop();

        } catch (err) {
            statusEl.innerHTML = `<div class="status-msg error">ASSEMBLY FAILED — ${err.message}</div>`;
            btn.disabled = false;
            btn.textContent = 'OPEN THE VOID GATE';
            PhantomEffects.shake();
        }
    },

    _revealFlag(flag) {
        const flagContainer = document.getElementById('flag-container');
        flagContainer.innerHTML = `
            <div class="flag-reveal">
                <div class="flag-label">\u25BC PHANTOM'S TRUE SIGNAL RECONSTRUCTED \u25BC</div>
                <div class="flag-value" id="flag-value"></div>
                <div style="margin-top: 15px; font-size: 0.75rem; color: rgba(0, 229, 255, 0.6);">
                    The void gate is open. The phantom has been found.<br>
                    You have pierced through the fractured signal.
                </div>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <button class="submit-btn" id="show-final-scoreboard" style="padding: 10px 25px;">
                    VIEW SCOREBOARD
                </button>
            </div>
        `;

        // Type out the flag
        const flagEl = document.getElementById('flag-value');
        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < flag.length) {
                flagEl.textContent += flag[i];
                i++;
            } else {
                clearInterval(typeInterval);
                const portal = document.getElementById('void-portal');
                if (portal) {
                    portal.style.borderColor = '#00ff41';
                    portal.style.boxShadow = '0 0 40px rgba(0, 255, 65, 0.4), 0 0 80px rgba(0, 255, 65, 0.2)';
                }
            }
        }, 60);

        // Scoreboard button
        document.getElementById('show-final-scoreboard')?.addEventListener('click', async () => {
            const panel = document.getElementById('scoreboard-panel');
            panel.style.display = 'block';
            await PhantomScoreboard.renderScoreboard(panel);
            panel.scrollIntoView({ behavior: 'smooth' });
        });
    }
};
