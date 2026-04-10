/**
 * 0xPh4nt0m CTF — Time-Based Hint System
 * Hints auto-reveal as time passes on each layer
 * Content is tricky but genuinely helpful — not misleading
 */

const HintSystem = {
    // Hints: tricky but actually point in the right direction
    hints: {
        layer1: [
            "Not every element you see is honest, and not every element that hides is silent. Some wear masks borrowed from ancient alphabets. Search beyond the Latin character set.",
            "The signal carries its sequence in attributes that describe oscillation and change. Order matters — and what's hidden transforms under a simple mathematical veil found in classic bitwise operations.",
            "Ninety degrees of separation between truth and noise. The resonance parameter holds the key to the transformation. Look at the root of all styling for a numerical constant."
        ],
        layer2: [
            "The phantom hides in depth, not on the surface. What standard tools reveal first is what the phantom wants you to find. Look where the spectrum goes quiet — not loud.",
            "Not all bits carry equal weight. The least significant is sometimes a liar. Seek significance one position deeper than you normally would. The true channel wears the coldest color.",
            "The image speaks only to those who already hold a key from a previous gate. Your first discovery serves double duty — hash it with the algorithm of 256 bits."
        ],
        layer3: [
            "Words carry meaning beyond their content. When thoughts begin, the first breath of each paragraph whispers a method and a hint — older than machines, yet still powerful.",
            "One name binds the phantom to its cipher. Read it forward, read it backward — identity is found where the data is labeled, not where it is displayed. Check the element that contains the transmissions.",
            "Three locks, three different mechanisms, three connected revelations. A polyalphabetic substitution opens the first. The second rearranges across rails. The third shifts by a sum that involves primes."
        ],
        layer4: [
            "The master key is derived, not stored. All three answers join together, separated by the simplest punctuation mark, then transformed by the algorithm that gives 256 bits of output.",
            "No further derivation is needed — the raw output becomes the key directly. The delimiter between answers is a single character you'd find between protocol fields.",
            "Order follows the natural sequence of your journey — first answer, then second, then third. The fragments concatenate to form the content between the flag wrapper braces."
        ]
    },

    // Time thresholds (ms) for each hint to auto-reveal per layer
    HINT_DELAYS: [
        5 * 60 * 1000,   // Hint 1: 5 minutes
        15 * 60 * 1000,  // Hint 2: 15 minutes
        28 * 60 * 1000   // Hint 3: 28 minutes
    ],

    // Track layer entry times and revealed hints
    _layerStartTimes: {},
    _revealed: {},
    _checkInterval: null,

    STORAGE_KEY: '__ψ_hints_state',

    init() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const state = JSON.parse(saved);
                this._layerStartTimes = state.layerStartTimes || {};
                this._revealed = state.revealed || {};
            }
        } catch {}
    },

    /**
     * Called when entering a new layer — start the hint timer
     */
    enterLayer(layerKey) {
        if (!this._layerStartTimes[layerKey]) {
            this._layerStartTimes[layerKey] = Date.now();
            this._saveState();
        }
        if (!this._revealed[layerKey]) {
            this._revealed[layerKey] = [];
        }
    },

    /**
     * Check which hints should be revealed based on elapsed time
     * @returns {Array} indices of hints that are now available
     */
    getAvailableHints(layerKey) {
        const startTime = this._layerStartTimes[layerKey];
        if (!startTime) return [];

        const elapsed = Date.now() - startTime;
        const available = [];

        for (let i = 0; i < this.HINT_DELAYS.length; i++) {
            if (elapsed >= this.HINT_DELAYS[i]) {
                available.push(i);
            }
        }
        return available;
    },

    /**
     * Get full hint info for a layer
     */
    getHints(layerKey) {
        const layerHints = this.hints[layerKey] || [];
        const available = this.getAvailableHints(layerKey);
        const revealed = this._revealed[layerKey] || [];

        return layerHints.map((text, index) => ({
            text,
            index,
            available: available.includes(index),
            revealed: revealed.includes(index),
            timeUntilMs: Math.max(0, this.HINT_DELAYS[index] - (Date.now() - (this._layerStartTimes[layerKey] || Date.now())))
        }));
    },

    /**
     * Mark a hint as viewed/revealed
     */
    revealHint(layerKey, index) {
        if (!this._revealed[layerKey]) this._revealed[layerKey] = [];
        if (!this._revealed[layerKey].includes(index)) {
            this._revealed[layerKey].push(index);
            this._saveState();
        }
    },

    /**
     * Format remaining time for a locked hint
     */
    formatCountdown(ms) {
        if (ms <= 0) return 'NOW';
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
    },

    _saveState() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
                layerStartTimes: this._layerStartTimes,
                revealed: this._revealed
            }));
        } catch {}
    }
};
