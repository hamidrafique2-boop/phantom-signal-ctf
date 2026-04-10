/**
 * 0xPh4nt0m CTF — Firebase Configuration
 * 
 * ╔══════════════════════════════════════════════════════════╗
 * ║  SETUP INSTRUCTIONS:                                     ║
 * ║                                                          ║
 * ║  1. Go to https://console.firebase.google.com            ║
 * ║  2. Create a new project (name: phantom-signal-ctf)      ║
 * ║  3. Go to Build → Realtime Database → Create Database    ║
 * ║  4. Choose "Start in test mode"                          ║
 * ║  5. Go to Project Settings → General → Your apps         ║
 * ║  6. Click "Web" (</>), register app                      ║
 * ║  7. Copy the firebaseConfig values below                 ║
 * ║  8. Update the security rules (see RULES below)          ║
 * ╚══════════════════════════════════════════════════════════╝
 * 
 * SECURITY RULES for Realtime Database:
 * {
 *   "rules": {
 *     "registrations": {
 *       ".read": true,
 *       "$alias": {
 *         ".write": "!data.exists()",
 *         ".validate": "newData.hasChildren(['fullName', 'affiliation', 'registeredAt'])"
 *       }
 *     },
 *     "scoreboard": {
 *       ".read": true,
 *       "$alias": {
 *         ".write": "!data.exists()",
 *         ".validate": "newData.hasChildren(['completedAt', 'timeElapsedMs'])"
 *       }
 *     },
 *     "firstBlood": {
 *       ".read": true,
 *       ".write": "!data.exists()"
 *     }
 *   }
 * }
 */

const FIREBASE_CONFIG = {
    // ═══ REPLACE THESE WITH YOUR FIREBASE PROJECT VALUES ═══
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
    // ═══════════════════════════════════════════════════════
};

// Set to true once you've filled in the config above
const FIREBASE_ENABLED = FIREBASE_CONFIG.apiKey !== "";
