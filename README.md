# 0xPh4nt0m — Fractured Signal

```
 ██████╗ ██╗  ██╗██████╗ ██╗  ██╗██╗  ██╗███╗   ██╗████████╗ ██████╗ ███╗   ███╗
██╔═████╗╚██╗██╔╝██╔══██╗██║  ██║██║  ██║████╗  ██║╚══██╔══╝██╔═══██╗████╗ ████║
██║██╔██║ ╚███╔╝ ██████╔╝███████║███████║██╔██╗ ██║   ██║   ██║   ██║██╔████╔██║
████╔╝██║ ██╔██╗ ██╔═══╝ ██╔══██║╚════██║██║╚██╗██║   ██║   ██║   ██║██║╚██╔╝██║
╚██████╔╝██╔╝ ██╗██║     ██║  ██║     ██║██║ ╚████║   ██║   ╚██████╔╝██║ ╚═╝ ██║
 ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝     ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝
```

---

## 📡 The Signal

Three weeks ago, monitoring station Theta-7 detected an anomalous transmission on a frequency that hasn't been active since the network shutdown of 2019. The signal carried no header, no routing data, no origin trace. It simply *appeared* — bleeding through dead infrastructure like a voice echoing through ruins.

Analysts who attempted to decode the transmission reported... inconsistencies. Their tools produced contradictory results. Their logs showed timestamps from dates that hadn't occurred. One researcher described the experience as *"trying to read a book that rewrites itself while you hold it."*

The entity behind the signal has been designated **0xPh4nt0m**.

We don't know what it is. We don't know where it came from. We know only that it is accelerating.

---

## 🕳️ The Challenge

This is a **multi-layer signal intercept challenge**. You are a network archaeologist tasked with reconstructing the phantom's fractured transmission.

- **Category:** Web + Cryptography + Steganography
- **Difficulty:** Extreme
- **Estimated Time:** 3–8 hours
- **Layers:** 4 sequential puzzle layers
- **Flag Format:** `0xPh4nt0m{...}`

Each layer requires a different discipline. Each layer's solution unlocks the next. The final flag can only be reconstructed by solving all four layers and combining the recovered fragments.

**There are no shortcuts.** The phantom's signal is cryptographically sealed against brute force, source inspection, and passive analysis. You must *solve* each layer.

---

## ⏱️ The Rules

- You have **one hour** from first access. The timer persists across page refreshes.
- When time expires, the terminal locks permanently. *The phantom's signal decays.*
- Three hints are available per layer. **Trust them at your own risk.**
- All puzzle data is contained within the static files. No external services are required.
- The flag is fragmented and encrypted across multiple files. No single file contains enough to recover it.

---

## 🚀 Deployment

This challenge is deployed as a static site. No backend required.

### GitHub Pages
1. Push this repository to GitHub
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch** → `main` → `/ (root)`
4. Wait for deployment (usually < 2 minutes)
5. Access at `https://<username>.github.io/<repo-name>/`

### Local Testing
Serve with any static file server:
```bash
python -m http.server 8000
# or
npx serve .
```

---

## ⚠️ Disclaimer

This challenge is designed for educational and competitive purposes only. The cryptographic techniques used are standard CTF fare — no actual malicious software or exploits are involved.

The phantom is watching.

---

*The void gate is opening.*
