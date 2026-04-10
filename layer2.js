/**
 * 0xPh4nt0m CTF — Layer 2: The Phantom's Visage
 * Steganography + Cross-layer crypto
 */

const Layer2 = {
    id: 'layer2',
    name: "THE PHANTOM'S VISAGE",

    render(container) {
        container.innerHTML = `
            <div class="terminal-panel">
                <div class="terminal-header">
                    <span class="terminal-dot"></span>
                    <span class="terminal-dot"></span>
                    <span class="terminal-dot"></span>
                    SPECTRAL ANALYSIS — LAYER 02
                </div>
                <div class="terminal-body" id="layer2-terminal">
                    <div class="terminal-line"><span class="prompt">$</span><span class="success-msg"> LAYER 02 ACCESS GRANTED</span></div>
                    <div class="terminal-line"><span class="prompt">$</span><span class="sys-msg"> loading spectral imaging data...</span></div>
                    <div class="terminal-line"><span class="warn-msg">WARNING: image contains multi-channel anomalies</span></div>
                    <div class="terminal-line"><span class="prompt">$</span><span class="sys-msg"> standard analysis may yield misleading results</span></div>
                    <div class="terminal-line">&nbsp;</div>
                    <div class="terminal-line">At the moment of the phantom's dissolution, a single frame</div>
                    <div class="terminal-line">was captured — a spectral snapshot of the entity's digital</div>
                    <div class="terminal-line">form as it fragmented into the void. This image is not what</div>
                    <div class="terminal-line">it appears to be.</div>
                    <div class="terminal-line">&nbsp;</div>
                    <div class="terminal-line" style="color: var(--accent-cyan);">Multiple layers of data are woven into its pixels. Some</div>
                    <div class="terminal-line" style="color: var(--accent-cyan);">channels carry only noise and misdirection. The true signal</div>
                    <div class="terminal-line" style="color: var(--accent-cyan);">requires tools that look beyond the visible spectrum and a</div>
                    <div class="terminal-line" style="color: var(--accent-cyan);">key that connects to what you have already discovered.</div>
                    <div class="terminal-line">&nbsp;</div>
                    <div class="terminal-line">Download the image. Analyze its spectral composition.</div>
                    <div class="terminal-line">Not all channels speak truth. Not all extractions are plaintext.</div>
                </div>
            </div>

            <div class="stego-image-container">
                <img src="assets/phantom_signal.png" alt="Phantom Signal Capture" id="stego-image"
                     title="LAST CAPTURED FRAME — SIGNAL ENTITY 0xPh4nt0m">
                <div class="stego-caption">
                    LAST CAPTURED FRAME — SIGNAL ENTITY 0xPh4nt0m — TIMESTAMP: ████████
                </div>
            </div>

            <div class="input-area" id="layer2-input-area">
                <span class="input-prompt">&gt;&gt; ENTER SPECTRAL RESONANCE CODE:</span>
                <input type="text" class="input-field" id="layer2-input"
                       placeholder="extract the phantom's resonance..." autocomplete="off" spellcheck="false">
                <button class="submit-btn" id="layer2-submit">TRANSMIT</button>
            </div>
            <div id="layer2-status"></div>
            <div class="hints-container" id="layer2-hints"></div>
            <div id="layer2-hint-reveal" class="hint-reveal"></div>
        `;

        document.getElementById('layer2-submit').addEventListener('click', () => this._submit());
        document.getElementById('layer2-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this._submit();
        });
    },

    async _submit() {
        const input = document.getElementById('layer2-input');
        const answer = input.value.trim();
        if (!answer) return;

        const statusEl = document.getElementById('layer2-status');
        statusEl.innerHTML = '<div class="status-msg info">Validating spectral resonance code...</div>';

        try {
            const isCorrect = await CryptoUtils.verifyAnswer(answer, PHANTOM_CONFIG.hashes.layer2);
            if (isCorrect) {
                statusEl.innerHTML = '<div class="status-msg success">SPECTRAL RESONANCE CONFIRMED — The phantom\'s visage reveals its truth</div>';
                PhantomEffects.successFlash(document.getElementById('layer2-input-area'));
                PhantomEffects.noiseBurst();
                sessionStorage.setItem('__l2_key', answer);
                const f2Data = await fetch('fragments/f2.json').then(r => r.json());
                const fragment2 = await CryptoUtils.decryptFragment(answer, f2Data);
                setTimeout(() => window.PhantomApp.advanceLayer(fragment2), 1500);
            } else {
                statusEl.innerHTML = '<div class="status-msg error">RESONANCE MISMATCH — The phantom rejects this code. Are you reading the right channel?</div>';
                PhantomEffects.shake();
                input.value = '';
                input.focus();
            }
        } catch (err) {
            statusEl.innerHTML = '<div class="status-msg error">ANALYSIS ERROR — Spectral data corrupted.</div>';
            PhantomEffects.shake();
        }
    }
};
