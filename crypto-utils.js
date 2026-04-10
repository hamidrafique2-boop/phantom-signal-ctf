/**
 * 0xPh4nt0m CTF — Web Crypto API Utilities
 * AES-GCM decryption, SHA-256 hashing, PBKDF2 key derivation
 */

const CryptoUtils = {
    /**
     * SHA-256 hash of a string, returned as hex
     */
    async sha256(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    /**
     * SHA-256 hash of a string, returned as ArrayBuffer
     */
    async sha256Raw(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        return await crypto.subtle.digest('SHA-256', data);
    },

    /**
     * Derive AES-256-GCM key from password using PBKDF2
     */
    async deriveKey(password, saltB64, iterations) {
        const encoder = new TextEncoder();
        const salt = this._b64ToUint8(saltB64);

        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: iterations,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );
    },

    /**
     * Import raw AES-256-GCM key from ArrayBuffer
     */
    async importRawKey(keyBuffer) {
        return await crypto.subtle.importKey(
            'raw',
            keyBuffer,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );
    },

    /**
     * Decrypt AES-256-GCM ciphertext
     * @param {CryptoKey} key - AES key
     * @param {string} ivB64 - Base64-encoded IV (12 bytes)
     * @param {string} ctB64 - Base64-encoded ciphertext + tag
     * @returns {string} - Decrypted plaintext
     */
    async decryptAesGcm(key, ivB64, ctB64) {
        const iv = this._b64ToUint8(ivB64);
        const ct = this._b64ToUint8(ctB64);

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            ct
        );

        return new TextDecoder().decode(decrypted);
    },

    /**
     * Decrypt a fragment using a password (PBKDF2 + AES-GCM)
     */
    async decryptFragment(password, fragmentData) {
        const key = await this.deriveKey(
            password,
            fragmentData.salt,
            fragmentData.iterations
        );
        return await this.decryptAesGcm(key, fragmentData.iv, fragmentData.ciphertext);
    },

    /**
     * Decrypt a fragment using a raw key (SHA-256 hash, no PBKDF2)
     */
    async decryptFragmentWithRawKey(keyHex, fragmentData) {
        const keyBytes = this._hexToUint8(keyHex);
        const key = await this.importRawKey(keyBytes);
        return await this.decryptAesGcm(key, fragmentData.iv, fragmentData.ciphertext);
    },

    /**
     * Verify an answer against a SHA-256 hash
     */
    async verifyAnswer(answer, expectedHash) {
        const hash = await this.sha256(answer);
        return hash === expectedHash;
    },

    // ── Utility conversions ──

    _b64ToUint8(b64) {
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    },

    _hexToUint8(hex) {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes;
    },

    _uint8ToHex(uint8) {
        return Array.from(uint8).map(b => b.toString(16).padStart(2, '0')).join('');
    }
};
