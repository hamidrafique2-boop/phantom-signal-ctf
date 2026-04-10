# 0xPh4nt0m — Fractured Signal: SOLUTION WALKTHROUGH

> ⚠️ **THIS FILE IS IN `.gitignore` AND MUST NEVER BE COMMITTED TO THE REPOSITORY.**
> It contains all answers, intermediate values, and the complete flag.

---

## Flag

```
0xPh4nt0m{v01d_wh1sp3rs_bl33d_thr0ugh_d34d_n3tw0rk}
```

### Flag Fragments
| Fragment | Content | Stored In |
|----------|---------|-----------|
| F1 | `v01d_wh1` | `fragments/f1.json` (AES-GCM encrypted) |
| F2 | `sp3rs_bl` | `fragments/f2.json` (AES-GCM encrypted) |
| F3 | `33d_thr0` | `fragments/f3.json` (AES-GCM encrypted) |
| F4 | `ugh_d34d_n3tw0rk` | `fragments/f4.json` (AES-GCM encrypted) |

---

## Layer 1: The Bleeding Frequency (Web/DOM Forensics)

### Answer
```
d34d_ch4nn3l_fr3q_7734
```

### SHA-256 Hash (stored in config.js)
```
8188ef00b23719452cc3f5173685aea5ab2a7ed5b0636e84d4cc81e6c52e7691
```

### Solution Steps

1. **Open DevTools** and inspect the page DOM

2. **Find hidden elements**: The page contains 522 hidden `<span>` elements scattered across 5 different containers in the HTML. These are styled to be completely invisible (`width:0; height:0; overflow:hidden; opacity:0`).

3. **Identify the real signal elements**: Among 500 decoy elements using Greek letter classes (`φ`, `θ`, `χ`, `ξ`, `Ω`, `λ`, `μ`, `σ`, `π`, `ε`), there are **22 elements with class `ψ`** (Greek small letter psi, Unicode U+03C8).

   Find them with:
   ```javascript
   document.querySelectorAll('.ψ')
   // or
   document.querySelectorAll('.\\u03C8')
   ```

4. **Extract data attributes**: Each real element has:
   - `data-ω` (data-omega): order index (0-21)
   - `data-Δ` (data-delta): hex-encoded XOR'd value

5. **Find the XOR mask**: In `css/style.css`, the CSS custom property `--ψ-resonance: 90` is set on `:root`. The value 90 (0x5A) is the XOR mask.

6. **Decode**:
   ```javascript
   const elements = [...document.querySelectorAll('.ψ')];
   const sorted = elements.sort((a, b) => 
       parseInt(a.getAttribute('data-ω')) - parseInt(b.getAttribute('data-ω'))
   );
   const answer = sorted.map(el => {
       const hexVal = parseInt(el.getAttribute('data-Δ'), 16);
       return String.fromCharCode(hexVal ^ 90);
   }).join('');
   console.log(answer); // "d34d_ch4nn3l_fr3q_7734"
   ```

---

## Layer 2: The Phantom's Visage (Steganography + Crypto)

### Answer
```
sp3ctr4l_r3s0n4nc3_47
```

### SHA-256 Hash
```
e5061cd798b0a5917379c4fc33721300e10a41541be7834d83c938a77a281c57
```

### Solution Steps

1. **Download the image** `assets/phantom_signal.png`

2. **Run LSB analysis** using a tool like `zsteg`:
   ```bash
   zsteg phantom_signal.png
   ```
   
   This reveals two readable messages:
   - **Red channel LSB**: `STATIC. NOISE. YOU ARE CHASING ECHOES IN A DEAD SIGNAL. THE PHANTOM DOES NOT SPEAK IN RED.`
   - **Green channel LSB**: `THE PHANTOM DOES NOT LIVE IN LIGHT. SEEK THE DEEPER SPECTRUM. THE VOID AWAITS BELOW.`
   
   **Both are red herrings.**

3. **Extract from Blue channel, bit 1** (not the LSB, but the second bit):
   ```python
   from PIL import Image
   import struct
   
   img = Image.open('phantom_signal.png')
   pixels = img.load()
   w, h = img.size
   
   # Extract bits from blue channel, bit position 1
   bits = []
   for y in range(h):
       for x in range(w):
           r, g, b = pixels[x, y]
           bits.append((b >> 1) & 1)
   
   # Read 4-byte length header
   length_bits = bits[:32]
   length = 0
   for bit in length_bits:
       length = (length << 1) | bit
   
   # Read data bytes
   data_bits = bits[32:32 + length * 8]
   data = bytearray()
   for i in range(0, len(data_bits), 8):
       byte = 0
       for bit in data_bits[i:i+8]:
           byte = (byte << 1) | bit
       data.append(byte)
   
   print(data.decode())  # "0xPH:S5bZHaA4ZOe5KvDv0z4QadkPI3fyEfTq9eOupKTnJ6e+0dhD7BRfsD5NS5936bAB"
   ```

4. **Parse the extracted data**: Remove the `0xPH:` marker prefix. The remaining string is Base64-encoded.

5. **Base64 decode**: The decoded bytes contain `IV (16 bytes) + AES-256-CBC ciphertext`.

6. **Derive the AES key** from the Layer 1 answer:
   ```python
   import hashlib
   key = hashlib.sha256(b"d34d_ch4nn3l_fr3q_7734").digest()  # 32 bytes
   ```
   Key hex: `8188ef00b23719452cc3f5173685aea5ab2a7ed5b0636e84d4cc81e6c52e7691`

7. **AES-256-CBC decrypt**:
   ```python
   from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
   from cryptography.hazmat.primitives import padding
   import base64
   
   raw = base64.b64decode("S5bZHaA4ZOe5KvDv0z4QadkPI3fyEfTq9eOupKTnJ6e+0dhD7BRfsD5NS5936bAB")
   iv = raw[:16]
   ct = raw[16:]
   
   cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
   decryptor = cipher.decryptor()
   padded = decryptor.update(ct) + decryptor.finalize()
   
   unpadder = padding.PKCS7(128).unpadder()
   plaintext = unpadder.update(padded) + unpadder.finalize()
   
   print(plaintext.decode())  # "sp3ctr4l_r3s0n4nc3_47"
   ```

---

## Layer 3: The Cipher Protocol (Classical Cryptanalysis)

### Answer
```
v1g3n3r3_pr0t0c0l_13
```

### SHA-256 Hash
```
5a1b14512dec08987fbabf2bea48d22022cd0beff31b4d39c97274cdb1fb57c5
```

### Solution Steps

#### Step 1: Find the Acrostic

The narrative text on Layer 3 has **13 paragraphs**. Take the first letter of each:
```
V - Vast networks...
I - In the deep frequencies...
G - Ghostly echoes...
E - Every attempt...
N - No standard decryption...
E - Encrypted within...
R - Researchers who...
E - Each fragment...
S - Signal analysts...
H - Hidden within...
I - Instruments calibrated...
F - Frequencies that...
T - Terminal analysis...
```
→ **VIGENERESHIFT** — a hint that one cipher is Vigenère and involves a shift.

#### Step 2: Find the Vigenère Key

The narrative block container has `id="MOTNAHP-xmit-03"`. Reversed: **PHANTOM**. This is the Vigenère key.

#### Step 3: Decrypt Transmission 01 (Vigenère)

Ciphertext: `IOE ETWXH UUZUSD IORRX HTT ZITGOX SLSPXBPH HNQ KWETZ DRVCPT AHR GSJI ARNGGYXZSVHB IXAH ETWXH VF GAFQT`

Key: `PHANTOM`

Plaintext: `THE RAILS NUMBER THREE THE SIGNAL DESCENDS AND RISES DECODE THE NEXT TRANSMISSION WITH RAILS OF THREE`

#### Step 4: Decrypt Transmission 02 (Rail Fence)

From the plaintext above: use Rail Fence cipher with **3 rails**.

Ciphertext: `TEENSFPELHAMBOSNHKYISITEUOALRMSEOTEHNONMEFRYEEELIHMLIBWPTURTV`

Plaintext: `THEKEYLIESIINTHESUMOFALLPRIMESBELOWTHEPHANTOMNUMBERFORTYSEVEN`

→ "THE KEY LIES IN THE SUM OF ALL PRIMES BELOW THE PHANTOM NUMBER FORTY SEVEN"

#### Step 5: Calculate the Shift

Sum of all primes below 47:
```
2 + 3 + 5 + 7 + 11 + 13 + 17 + 19 + 23 + 29 + 31 + 37 + 41 + 43 = 281
281 mod 26 = 21
```

The Caesar shift is **21** (or equivalently, decrypt with shift -21 / +5).

#### Step 6: Decrypt Transmission 03 (Caesar)

Ciphertext: `q1b3i3m3_km0o0x0g_13`

Shift each letter back by 21 (or forward by 5):
```
q → v
b → g
i → n
m → r
k → p
m → r
o → t
x → c
g → l
```

Plaintext: **`v1g3n3r3_pr0t0c0l_13`**

---

## Layer 4: The Void Gate (Final Assembly)

### Master Key Derivation

Combine all three layer answers with `:` separator:
```
d34d_ch4nn3l_fr3q_7734:sp3ctr4l_r3s0n4nc3_47:v1g3n3r3_pr0t0c0l_13
```

SHA-256 hash:
```
e2653e511fdc515ceae3780039d907d1af2a570e77840fc8a8363c5279482de0
```

This 32-byte hash is used as a raw AES-256-GCM key (no PBKDF2) to decrypt `fragments/f4.json`.

### Fragment Assembly

| Fragment | Value |
|----------|-------|
| F1 | `v01d_wh1` |
| F2 | `sp3rs_bl` |
| F3 | `33d_thr0` |
| F4 | `ugh_d34d_n3tw0rk` |

Concatenation: `v01d_wh1` + `sp3rs_bl` + `33d_thr0` + `ugh_d34d_n3tw0rk` = `v01d_wh1sp3rs_bl33d_thr0ugh_d34d_n3tw0rk`

### Final Flag
```
0xPh4nt0m{v01d_wh1sp3rs_bl33d_thr0ugh_d34d_n3tw0rk}
```

---

## Security Analysis

### What's Stored in the Public Repo (Safe)

| File | Contains | Recoverable Without Solving? |
|------|----------|------------------------------|
| `js/config.js` | SHA-256 hashes, cipher texts | Hashes are irreversible; cipher texts are the puzzle |
| `fragments/f1-f4.json` | AES-GCM encrypted blobs + salts + IVs | ❌ Encryption is unbreakable without keys |
| `assets/phantom_signal.png` | Stego data (encrypted) | Extractable but encrypted — needs L1 answer |
| `css/style.css` | XOR mask value (90) | Only useful if you already found the ψ elements |
| `index.html` | Hidden DOM elements with encoded values | Encoded, not plaintext; requires XOR mask + ordering |

### What's NOT in the Repo

- The flag in any form (plaintext, encoded, or as a single encrypted blob)
- Layer answers in any form
- Decryption keys
- Any file that reveals the flag through `git log`, text search, or source inspection

### Verification Commands

```bash
# Should return zero results:
grep -r "v01d_wh1sp3rs\|bl33d_thr0ugh\|d34d_n3tw0rk" --include="*.html" --include="*.js" --include="*.css" --include="*.json" .
grep -r "d34d_ch4nn3l\|sp3ctr4l_r3s0n4nc3\|v1g3n3r3_pr0t0c0l" --include="*.html" --include="*.js" --include="*.css" --include="*.json" .
```
