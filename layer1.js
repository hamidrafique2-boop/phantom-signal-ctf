/**
 * 0xPh4nt0m CTF — Layer 1: The Bleeding Frequency
 * DOM Forensics puzzle
 */

const Layer1 = {
    id: 'layer1',
    name: 'THE BLEEDING FREQUENCY',

    render(container) {
        container.innerHTML = `
            <div class="terminal-panel">
                <div class="terminal-header">
                    <span class="terminal-dot"></span>
                    <span class="terminal-dot"></span>
                    <span class="terminal-dot"></span>
                    SIGNAL INTERCEPT — LAYER 01
                </div>
                <div class="terminal-body" id="layer1-terminal">
                    <div class="terminal-line"><span class="prompt">$</span><span class="sys-msg"> intercepting signal on dead channel...</span></div>
                    <div class="terminal-line"><span class="prompt">$</span><span class="sys-msg"> frequency anomaly detected...</span></div>
                    <div class="terminal-line"><span class="prompt">$</span><span class="sys-msg"> source: UNKNOWN — coordinates map to void space</span></div>
                    <div class="terminal-line"><span class="prompt">$</span><span class="sys-msg"> the signal bleeds through the network substrate</span></div>
                    <div class="terminal-line"><span class="prompt">$</span><span class="sys-msg"> fragments embedded in the carrier wave...</span></div>
                    <div class="terminal-line"><span class="warn-msg">WARNING: signal appears to be self-modifying</span></div>
                    <div class="terminal-line">&nbsp;</div>
                    <div class="terminal-line">The phantom's first transmission arrived as a corrupted</div>
                    <div class="terminal-line">frequency map — a pattern of oscillations woven into the</div>
                    <div class="terminal-line">substrate of this terminal itself. The entity encodes its</div>
                    <div class="terminal-line">presence not in the data that flows through the network,</div>
                    <div class="terminal-line">but in the network's own structural elements.</div>
                    <div class="terminal-line">&nbsp;</div>
                    <div class="terminal-line" style="color: var(--accent-cyan);">The signal is part of the architecture. You are inside it.</div>
                    <div class="terminal-line" style="color: var(--accent-cyan);">Analyze the structure. Find the frequency signature.</div>
                    <div class="terminal-line" style="color: var(--accent-cyan);">The true nodes hide among hundreds of decoys — distinguished</div>
                    <div class="terminal-line" style="color: var(--accent-cyan);">only by their identity, not their appearance.</div>
                </div>
            </div>

            <div class="input-area" id="layer1-input-area">
                <span class="input-prompt">&gt;&gt; ENTER FREQUENCY SIGNATURE:</span>
                <input type="text" class="input-field" id="layer1-input"
                       placeholder="decode the signal..." autocomplete="off" spellcheck="false">
                <button class="submit-btn" id="layer1-submit">TRANSMIT</button>
            </div>
            <div id="layer1-status"></div>
            <div class="hints-container" id="layer1-hints"></div>
            <div id="layer1-hint-reveal" class="hint-reveal"></div>
        `;

        document.getElementById('layer1-submit').addEventListener('click', () => this._submit());
        document.getElementById('layer1-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this._submit();
        });
    },

    async _submit() {
        const input = document.getElementById('layer1-input');
        const answer = input.value.trim();
        if (!answer) return;

        const statusEl = document.getElementById('layer1-status');
        statusEl.innerHTML = '<div class="status-msg info">Verifying frequency signature...</div>';

        try {
            const isCorrect = await CryptoUtils.verifyAnswer(answer, PHANTOM_CONFIG.hashes.layer1);
            if (isCorrect) {
                statusEl.innerHTML = '<div class="status-msg success">FREQUENCY SIGNATURE ACCEPTED — Signal lock acquired</div>';
                PhantomEffects.successFlash(document.getElementById('layer1-input-area'));
                PhantomEffects.noiseBurst();
                sessionStorage.setItem('__l1_key', answer);
                const f1Data = await fetch('fragments/f1.json').then(r => r.json());
                const fragment1 = await CryptoUtils.decryptFragment(answer, f1Data);
                setTimeout(() => window.PhantomApp.advanceLayer(fragment1), 1500);
            } else {
                statusEl.innerHTML = '<div class="status-msg error">INVALID FREQUENCY — Signal rejected. The phantom does not recognize this signature.</div>';
                PhantomEffects.shake();
                input.value = '';
                input.focus();
            }
        } catch (err) {
            statusEl.innerHTML = '<div class="status-msg error">DECRYPTION ERROR — Signal corrupted during verification.</div>';
            PhantomEffects.shake();
        }
    }
};
