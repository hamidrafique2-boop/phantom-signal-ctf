/**
 * 0xPh4nt0m CTF — Scoreboard & Registration System
 * Firebase-backed scoreboard with first blood tracking + one-time access
 * Falls back to localStorage-only when Firebase is not configured
 */

const PhantomScoreboard = {
    db: null,
    _currentUser: null,
    _isFirebaseReady: false,
    STORAGE_KEY: '__ψ_user_reg',
    COMPLETED_KEY: '__ψ_completed',

    /**
     * Initialize Firebase (if configured)
     */
    init() {
        if (typeof FIREBASE_ENABLED !== 'undefined' && FIREBASE_ENABLED && typeof firebase !== 'undefined') {
            try {
                firebase.initializeApp(FIREBASE_CONFIG);
                this.db = firebase.database();
                this._isFirebaseReady = true;
                console.log('[Scoreboard] Firebase connected');
            } catch (e) {
                console.warn('[Scoreboard] Firebase init failed, using local-only mode:', e.message);
            }
        } else {
            console.log('[Scoreboard] Firebase not configured, using local-only mode');
        }
    },

    /**
     * Check if user is already registered locally
     */
    getLocalUser() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch { return null; }
    },

    /**
     * Check if challenge was already completed
     */
    isCompleted() {
        try {
            return localStorage.getItem(this.COMPLETED_KEY) === 'true';
        } catch { return false; }
    },

    /**
     * Register a new user
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async registerUser(alias, fullName, affiliation) {
        // Sanitize alias (alphanumeric + underscore only)
        const cleanAlias = alias.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
        if (cleanAlias.length < 2 || cleanAlias.length > 24) {
            return { success: false, error: 'Alias must be 2-24 characters (alphanumeric, underscore, hyphen)' };
        }
        if (!fullName.trim() || fullName.trim().length < 2) {
            return { success: false, error: 'Full name is required (minimum 2 characters)' };
        }
        if (!affiliation.trim() || affiliation.trim().length < 2) {
            return { success: false, error: 'Affiliation is required (minimum 2 characters)' };
        }

        const userData = {
            alias: cleanAlias,
            fullName: fullName.trim(),
            affiliation: affiliation.trim(),
            registeredAt: Date.now()
        };

        // Check Firebase for existing alias
        if (this._isFirebaseReady) {
            try {
                const snapshot = await this.db.ref(`registrations/${cleanAlias}`).once('value');
                if (snapshot.exists()) {
                    return { success: false, error: `Alias "${cleanAlias}" is already taken. This terminal allows one session per operative.` };
                }
                // Register in Firebase
                await this.db.ref(`registrations/${cleanAlias}`).set({
                    fullName: userData.fullName,
                    affiliation: userData.affiliation,
                    registeredAt: firebase.database.ServerValue.TIMESTAMP
                });
            } catch (e) {
                console.warn('[Scoreboard] Firebase registration failed:', e.message);
                // Continue with local-only
            }
        }

        // Store locally
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
        this._currentUser = userData;

        return { success: true };
    },

    /**
     * Submit completion to scoreboard
     */
    async submitCompletion(timeElapsedMs) {
        const user = this.getLocalUser();
        if (!user) return;

        // Mark completed locally
        localStorage.setItem(this.COMPLETED_KEY, 'true');

        let isFirstBlood = false;

        if (this._isFirebaseReady) {
            try {
                // Check first blood
                const fbSnapshot = await this.db.ref('firstBlood').once('value');
                if (!fbSnapshot.exists()) {
                    // We might be first blood!
                    try {
                        await this.db.ref('firstBlood').set({
                            alias: user.alias,
                            completedAt: firebase.database.ServerValue.TIMESTAMP
                        });
                        isFirstBlood = true;
                    } catch {
                        // Someone else got it
                    }
                }

                // Submit to scoreboard
                await this.db.ref(`scoreboard/${user.alias}`).set({
                    fullName: user.fullName,
                    affiliation: user.affiliation,
                    completedAt: firebase.database.ServerValue.TIMESTAMP,
                    timeElapsedMs: timeElapsedMs,
                    firstBlood: isFirstBlood
                });
            } catch (e) {
                console.warn('[Scoreboard] Firebase submission failed:', e.message);
            }
        }

        return { isFirstBlood };
    },

    /**
     * Fetch scoreboard entries
     * @returns {Promise<Array>}
     */
    async getScoreboard() {
        if (!this._isFirebaseReady) return [];

        try {
            const snapshot = await this.db.ref('scoreboard').orderByChild('timeElapsedMs').once('value');
            const entries = [];
            snapshot.forEach(child => {
                const data = child.val();
                entries.push({
                    alias: child.key,
                    fullName: data.fullName || '',
                    affiliation: data.affiliation || '',
                    timeElapsedMs: data.timeElapsedMs || 0,
                    completedAt: data.completedAt || 0,
                    firstBlood: data.firstBlood || false
                });
            });
            return entries;
        } catch (e) {
            console.warn('[Scoreboard] Failed to fetch scoreboard:', e.message);
            return [];
        }
    },

    /**
     * Format milliseconds as MM:SS
     */
    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        if (hours > 0) {
            return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
        }
        return `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    },

    /**
     * Render the scoreboard panel
     */
    async renderScoreboard(container) {
        const entries = await this.getScoreboard();
        
        if (entries.length === 0) {
            container.innerHTML = `
                <div class="scoreboard-empty">
                    <div class="scoreboard-empty-text">NO SIGNALS RECONSTRUCTED YET</div>
                    <div class="scoreboard-empty-sub">Be the first operative to breach the void gate</div>
                </div>
            `;
            return;
        }

        let rows = '';
        entries.forEach((entry, idx) => {
            const rank = idx + 1;
            const fbBadge = entry.firstBlood ? '<span class="first-blood-badge">⚡ FIRST BLOOD</span>' : '';
            const rankClass = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : '';
            
            rows += `
                <tr class="${rankClass}">
                    <td class="sb-rank">#${rank}</td>
                    <td class="sb-alias">${this._escapeHtml(entry.alias)} ${fbBadge}</td>
                    <td class="sb-affiliation">${this._escapeHtml(entry.affiliation)}</td>
                    <td class="sb-time">${this.formatTime(entry.timeElapsedMs)}</td>
                </tr>
            `;
        });

        container.innerHTML = `
            <table class="scoreboard-table">
                <thead>
                    <tr>
                        <th>RANK</th>
                        <th>OPERATIVE</th>
                        <th>AFFILIATION</th>
                        <th>TIME</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    },

    _escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
