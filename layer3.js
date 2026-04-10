/**
 * 0xPh4nt0m CTF — Layer 3: The Cipher Protocol
 * Multi-cipher cryptanalysis
 */

const Layer3 = {
    id: 'layer3',
    name: 'THE CIPHER PROTOCOL',

    narrativeParagraphs: [
        "Vast networks of forgotten data pulse beneath the surface of the dying grid. Every transmission we intercept carries fragments of something ancient, something that predates the shutdown protocol by decades. The phantom's signal grows stronger here.",
        "In the deep frequencies, patterns emerge that defy conventional analysis. The waveforms carry a mathematical signature that no known compression algorithm can produce. Something is encoding itself into the static.",
        "Ghostly echoes reverberate through the dead channels, each one a mirror of a transmission that should not exist. The protocol was terminated. The servers were destroyed. Yet the signal persists, defiant against entropy itself.",
        "Every attempt to locate the signal's origin leads to contradictions. The transmission appears to emanate from seventeen different nodes simultaneously, each one reporting coordinates that map to locations that no longer exist on any known network topology.",
        "No standard decryption has yielded results. The intercepted packets use a layered encoding scheme that wraps each fragment in multiple shells of obfuscation. Brute force is futile here \u2014 the keyspace is deliberately designed to resist computational attacks.",
        "Encrypted within the deepest layer of each transmission lies a timestamp that predates the internet itself. How this is possible remains the central mystery. The phantom operates outside our understanding of time and protocol.",
        "Researchers who have attempted to analyze the signal's carrier wave report experiencing temporal anomalies \u2014 their clocks desynchronize, their logs show entries from dates that haven't occurred. The signal appears to bend causality around itself.",
        "Each fragment we recover seems to decay rapidly once extracted from the carrier wave. The data degrades as if it were designed to exist only within the phantom's transmission medium. Preservation requires techniques we have not yet developed.",
        "Signal analysts have noted that the transmission follows a predictable mathematical pattern, but one that references a branch of number theory that was only formalized in theoretical papers from the late twentieth century.",
        "Hidden within the modulation of the carrier wave, there exists a secondary signal \u2014 a whisper beneath the whisper. This sub-signal appears to contain instructions, though their purpose remains opaque to all who have examined them.",
        "Instruments calibrated to detect quantum-level fluctuations in the signal report anomalous readings. The phantom's transmission does not merely carry data \u2014 it appears to alter the fundamental properties of the medium through which it travels.",
        "Frequencies that should be impossible to generate with any known hardware appear regularly in the phantom's transmissions. These frequencies correspond to mathematical constants \u2014 pi, euler's number, the golden ratio \u2014 encoded as resonance patterns.",
        "Terminal analysis confirms that the phantom's signal is accelerating. Each transmission arrives sooner than the last, the intervals shrinking according to a convergent series. Something is approaching. The void gate is opening."
    ],

    render(container) {
        let narrativeHtml = '';
        for (const p of this.narrativeParagraphs) {
            narrativeHtml += `<p>${p}</p>`;
        }

        container.innerHTML = `
            <div class="terminal-panel">
                <div class="terminal-header">
                    <span class="terminal-dot"></span>
                    <span class="terminal-dot"></span>
                    <span class="terminal-dot"></span>
                    CIPHER PROTOCOL ANALYSIS — LAYER 03
                </div>
                <div class="terminal-body" id="layer3-terminal">
                    <div class="terminal-line"><span class="prompt">$</span><span class="success-msg"> LAYER 03 ACCESS GRANTED</span></div>
                    <div class="terminal-line"><span class="prompt">$</span><span class="sys-msg"> intercepted transmissions loading...</span></div>
                    <div class="terminal-line"><span class="warn-msg">WARNING: multiple cipher layers detected in transmission chain</span></div>
                    <div class="terminal-line">&nbsp;</div>
                    <div class="terminal-line">Before the network died, the phantom broadcast three final</div>
                    <div class="terminal-line">transmissions. Each uses a different encoding protocol —</div>
                    <div class="terminal-line">ancient methods that predate digital communication. The</div>
                    <div class="terminal-line">transmissions are not independent. They form a chain: solving</div>
                    <div class="terminal-line">one reveals the method to solve the next.</div>
                    <div class="terminal-line">&nbsp;</div>
                    <div class="terminal-line" style="color: var(--accent-cyan);">Read everything carefully. The phantom has left clues in</div>
                    <div class="terminal-line" style="color: var(--accent-cyan);">every word, every label, every structural choice. The key to</div>
                    <div class="terminal-line" style="color: var(--accent-cyan);">the first cipher hides in the identity of the container.</div>
                    <div class="terminal-line" style="color: var(--accent-cyan);">The final transmission holds your answer.</div>
                </div>
            </div>

            <div class="narrative-block" id="MOTNAHP-xmit-03">
                ${narrativeHtml}
            </div>

            <div class="cipher-block">
                <div class="cipher-label">INTERCEPTED TRANSMISSION 01 — PROTOCOL UNKNOWN</div>
                <div class="cipher-text">${PHANTOM_CONFIG.layer3.cipher1}</div>
            </div>

            <div class="cipher-block">
                <div class="cipher-label">INTERCEPTED TRANSMISSION 02 — ENCODING UNKNOWN</div>
                <div class="cipher-text">${PHANTOM_CONFIG.layer3.cipher2}</div>
            </div>

            <div class="cipher-block">
                <div class="cipher-label">INTERCEPTED TRANSMISSION 03 — FINAL PROTOCOL KEY</div>
                <div class="cipher-text">${PHANTOM_CONFIG.layer3.cipher3}</div>
            </div>

            <div class="input-area" id="layer3-input-area">
                <span class="input-prompt">&gt;&gt; ENTER DECRYPTED PROTOCOL KEY:</span>
                <input type="text" class="input-field" id="layer3-input"
                       placeholder="decrypt all three transmissions..." autocomplete="off" spellcheck="false">
                <button class="submit-btn" id="layer3-submit">TRANSMIT</button>
            </div>
            <div id="layer3-status"></div>
            <div class="hints-container" id="layer3-hints"></div>
            <div id="layer3-hint-reveal" class="hint-reveal"></div>
        `;

        document.getElementById('layer3-submit').addEventListener('click', () => this._submit());
        document.getElementById('layer3-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this._submit();
        });
    },

    async _submit() {
        const input = document.getElementById('layer3-input');
        const answer = input.value.trim();
        if (!answer) return;

        const statusEl = document.getElementById('layer3-status');
        statusEl.innerHTML = '<div class="status-msg info">Decoding protocol key...</div>';

        try {
            const isCorrect = await CryptoUtils.verifyAnswer(answer, PHANTOM_CONFIG.hashes.layer3);
            if (isCorrect) {
                statusEl.innerHTML = '<div class="status-msg success">PROTOCOL KEY ACCEPTED — Cipher chain broken. The void gate responds.</div>';
                PhantomEffects.successFlash(document.getElementById('layer3-input-area'));
                PhantomEffects.noiseBurst();
                sessionStorage.setItem('__l3_key', answer);
                const f3Data = await fetch('fragments/f3.json').then(r => r.json());
                const fragment3 = await CryptoUtils.decryptFragment(answer, f3Data);
                setTimeout(() => window.PhantomApp.advanceLayer(fragment3), 1500);
            } else {
                statusEl.innerHTML = '<div class="status-msg error">PROTOCOL MISMATCH — The cipher chain remains intact. Analyze deeper.</div>';
                PhantomEffects.shake();
                input.value = '';
                input.focus();
            }
        } catch (err) {
            statusEl.innerHTML = '<div class="status-msg error">DECRYPTION ERROR — Protocol data corrupted.</div>';
            PhantomEffects.shake();
        }
    }
};
