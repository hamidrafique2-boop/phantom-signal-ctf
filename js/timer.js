/**
 * 0xPh4nt0m CTF — Timer System
 * 1-hour countdown with localStorage persistence and tamper detection
 */

const PhantomTimer = {
    DURATION_MS: 3600000, // 1 hour
    STORAGE_KEY: '__\u03C8_signal_epoch',  // ψ_signal_epoch — obfuscated key
    _interval: null,
    _startTime: null,
    _onExpire: null,
    _onTick: null,

    /**
     * Initialize the timer
     * @param {Function} onTick - Called every second with {hours, minutes, seconds, totalMs, percentage}
     * @param {Function} onExpire - Called when timer reaches zero
     */
    init(onTick, onExpire) {
        this._onTick = onTick;
        this._onExpire = onExpire;

        // Try to restore from localStorage
        const stored = this._loadState();
        
        if (stored && stored.startTime) {
            // Validate checksum (light tamper detection)
            const expectedChecksum = this._computeChecksum(stored.startTime);
            if (stored.checksum !== expectedChecksum) {
                // Tampered — reset with penalty (set start time 10 minutes earlier)
                this._startTime = Date.now() - 600000;
                this._saveState();
            } else {
                this._startTime = stored.startTime;
            }
        } else {
            // First visit — start fresh
            this._startTime = Date.now();
            this._saveState();
        }

        // Check if already expired
        if (this.getRemainingMs() <= 0) {
            this._expire();
            return;
        }

        // Start ticking
        this._tick();
        this._interval = setInterval(() => this._tick(), 1000);
    },

    /**
     * Get remaining time in milliseconds
     */
    getRemainingMs() {
        const elapsed = Date.now() - this._startTime;
        return Math.max(0, this.DURATION_MS - elapsed);
    },

    /**
     * Format remaining time as object
     */
    getTimeComponents() {
        const remaining = this.getRemainingMs();
        const totalSeconds = Math.floor(remaining / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const percentage = (remaining / this.DURATION_MS) * 100;

        return { hours, minutes, seconds, totalMs: remaining, percentage };
    },

    /**
     * Format as display string HH:MM:SS
     */
    formatDisplay() {
        const { hours, minutes, seconds } = this.getTimeComponents();
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    },

    /**
     * Stop the timer (used on completion)
     */
    stop() {
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
    },

    // ── Internal ──

    _tick() {
        const components = this.getTimeComponents();
        
        if (components.totalMs <= 0) {
            this._expire();
            return;
        }

        if (this._onTick) {
            this._onTick(components);
        }
    },

    _expire() {
        this.stop();
        if (this._onExpire) {
            this._onExpire();
        }
    },

    _loadState() {
        try {
            const json = localStorage.getItem(this.STORAGE_KEY);
            return json ? JSON.parse(json) : null;
        } catch {
            return null;
        }
    },

    _saveState() {
        try {
            const state = {
                startTime: this._startTime,
                checksum: this._computeChecksum(this._startTime)
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
        } catch {
            // localStorage unavailable — continue without persistence
        }
    },

    _computeChecksum(startTime) {
        // Simple tamper detection checksum
        return ((startTime * 7 + 42) & 0xFFFF).toString(16);
    }
};
