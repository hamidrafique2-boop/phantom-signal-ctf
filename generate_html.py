"""
Generate final index.html with:
- Firebase SDK scripts
- Registration overlay
- Layer 1 DOM elements scattered throughout
- User alias display in header
"""
import random

# Read the generated elements
with open("build/layer1_elements.html", "r", encoding="utf-8") as f:
    elements = [line.strip() for line in f if line.strip()]

# Split elements into groups to scatter throughout the HTML
random.seed(99)
random.shuffle(elements)
groups = [[], [], [], [], []]
for i, elem in enumerate(elements):
    groups[i % 5].append(elem)

group_html = []
for g in groups:
    group_html.append("\n".join(g))

html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="A fractured signal bleeds through a dying network. Intercept the phantom's transmission. Solve the layers. Reconstruct the signal.">
    <meta name="theme-color" content="#050508">
    <meta name="robots" content="noindex, nofollow">
    <title>0xPh4nt0m — Fractured Signal</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>👻</text></svg>">
</head>
<body>
    <!-- Signal visualization canvas -->
    <canvas id="signal-canvas"></canvas>

    <!-- ═══ REGISTRATION OVERLAY ═══ -->
    <div class="registration-overlay" id="registration-overlay">
        <div class="reg-container">
            <div class="reg-panel">
                <div class="reg-header">
                    <h2>Access Terminal</h2>
                    <div class="reg-subtitle">SIGNAL ENTITY 0xPh4nt0m — OPERATIVE REGISTRATION</div>
                </div>
                <div class="reg-body">
                    <div class="reg-warning">
                        ⚠ THIS TERMINAL SESSION IS ONE-TIME ONLY ⚠<br>
                        Once initiated, your signal intercept cannot be restarted.<br>
                        You have 60 minutes. Choose your identity carefully.
                    </div>
                    <form id="reg-form">
                        <div class="reg-field">
                            <label for="reg-alias">&gt;&gt; Operative Alias</label>
                            <input type="text" id="reg-alias" placeholder="your_handle" 
                                   required minlength="2" maxlength="24" autocomplete="off" spellcheck="false">
                        </div>
                        <div class="reg-field">
                            <label for="reg-fullname">&gt;&gt; Full Name</label>
                            <input type="text" id="reg-fullname" placeholder="your full name" 
                                   required minlength="2" maxlength="64" autocomplete="off">
                        </div>
                        <div class="reg-field">
                            <label for="reg-affiliation">&gt;&gt; Affiliation</label>
                            <input type="text" id="reg-affiliation" placeholder="team, org, or university" 
                                   required minlength="2" maxlength="64" autocomplete="off">
                        </div>
                        <button type="submit" class="reg-submit-btn" id="reg-submit">
                            INITIATE SIGNAL INTERCEPT
                        </button>
                    </form>
                    <div class="reg-error" id="reg-error"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Game Over Overlay -->
    <div class="game-over-overlay" id="game-over-overlay">
        <div class="game-over-text" data-text="SIGNAL LOST">SIGNAL LOST</div>
        <div class="game-over-sub">THE PHANTOM'S TRANSMISSION HAS DECAYED BEYOND RECOVERY</div>
        <div class="game-over-sub" style="margin-top: 10px; color: rgba(255, 0, 64, 0.4);">
            TIME EXPIRED — CHALLENGE LOCKED
        </div>
    </div>

    <!-- ════════ HIDDEN SIGNAL ELEMENTS — NOISE FIELD ════════ -->
    <div aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;">
        <div class="substrate-noise-field" data-field="alpha">
{group_html[0]}
        </div>
    </div>

    <div class="phantom-container">
        <!-- Header -->
        <header class="phantom-header" id="phantom-header">
            <div class="header-title">
                <span class="phantom-name glitch-text" data-text="0xPh4nt0m">0xPh4nt0m</span>
                <span style="color: var(--text-dim);"> SIGNAL FEED</span>
            </div>
            <span class="user-alias" id="user-alias-display"></span>
            <div class="timer-display" id="timer-display">01:00:00</div>
            <!-- substrate fragments -->
            <div aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden;">
{group_html[1]}
            </div>
        </header>

        <!-- Layer Progress -->
        <div class="layer-progress" id="layer-progress">
            <span class="label">LAYER</span>
            <div class="progress-dots">
                <div class="progress-dot active" id="progress-dot-1"></div>
                <div class="progress-dot" id="progress-dot-2"></div>
                <div class="progress-dot" id="progress-dot-3"></div>
                <div class="progress-dot" id="progress-dot-4"></div>
            </div>
            <span class="layer-name" id="current-layer-name">THE BLEEDING FREQUENCY</span>
        </div>

        <!-- Signal Integrity Bar -->
        <div class="signal-bar">
            <span class="label">Signal Integrity</span>
            <div class="signal-meter">
                <div class="signal-meter-fill" id="signal-fill" style="width: 0%"></div>
            </div>
            <span class="signal-percentage" id="signal-pct">0%</span>
            <!-- deeper substrate -->
            <div aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden;">
{group_html[2]}
            </div>
        </div>

        <!-- Layer Content (dynamically rendered) -->
        <main id="layer-content">
            <!-- Layer content injected by JS -->
        </main>

        <!-- Footer -->
        <footer style="padding: 20px 0; text-align: center; font-size: 0.65rem; color: var(--text-dim); letter-spacing: 2px; border-top: 1px solid var(--border-glow); margin-top: 30px;">
            <div>SIGNAL INTERCEPT TERMINAL v0.7.3 — UNAUTHORIZED ACCESS DETECTED</div>
            <div style="margin-top: 5px; color: rgba(0, 229, 255, 0.2);">
                0xPh4nt0m has been watching since before the network died
            </div>
            <!-- substrate echo -->
            <div aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden;">
{group_html[3]}
            </div>
        </footer>
    </div>

    <!-- Final substrate layer -->
    <div aria-hidden="true" style="position:fixed;top:-9999px;left:-9999px;width:0;height:0;overflow:hidden;pointer-events:none;">
        <div class="substrate-noise-field" data-field="omega">
{group_html[4]}
        </div>
    </div>

    <!-- ═══ Firebase SDK (optional — scoreboard) ═══ -->
    <script src="https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.14.0/firebase-database-compat.js"></script>

    <!-- ═══ Application Scripts ═══ -->
    <script src="js/firebase-config.js"></script>
    <script src="js/config.js"></script>
    <script src="js/crypto-utils.js"></script>
    <script src="js/timer.js"></script>
    <script src="js/hints.js"></script>
    <script src="js/effects.js"></script>
    <script src="js/scoreboard.js"></script>
    <script src="js/layer1.js"></script>
    <script src="js/layer2.js"></script>
    <script src="js/layer3.js"></script>
    <script src="js/layer4.js"></script>
    <script src="js/app.js"></script>
</body>
</html>'''

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)

print(f"Generated index.html ({len(html)} chars)")
print(f"Elements distributed across 5 groups: {[len(g) for g in groups]}")
