"""
0xPh4nt0m CTF Challenge — Master Build Script
Generates ALL crypto materials, cipher texts, DOM elements, and stego image.
This file is in .gitignore and NEVER deployed.
"""

import hashlib
import os
import json
import base64
import struct
import sys
from pathlib import Path

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding as sym_padding

from PIL import Image
import io
import random
import math

# ============================================================
# CONFIGURATION — THE SECRETS (never deployed)
# ============================================================

FLAG = "0xPh4nt0m{v01d_wh1sp3rs_bl33d_thr0ugh_d34d_n3tw0rk}"

# Flag fragments
FRAGMENTS = {
    "f1": "v01d_wh1",
    "f2": "sp3rs_bl",
    "f3": "33d_thr0",
    "f4": "ugh_d34d_n3tw0rk"
}

# Layer answers (what players must discover)
LAYER_ANSWERS = {
    "layer1": "d34d_ch4nn3l_fr3q_7734",
    "layer2": "sp3ctr4l_r3s0n4nc3_47",
    "layer3": "v1g3n3r3_pr0t0c0l_13"
}

# XOR mask for Layer 1 DOM encoding
XOR_MASK = 0x5A  # 90 decimal, stored as CSS --ψ-resonance: 90

# Vigenère key for Layer 3
VIGENERE_KEY = "PHANTOM"

# PBKDF2 iterations
PBKDF2_ITERATIONS = 100000

# Base image path
BASE_IMAGE_PATH = sys.argv[1] if len(sys.argv) > 1 else None

# Output directory
PROJECT_DIR = Path(__file__).parent.parent
FRAGMENTS_DIR = PROJECT_DIR / "fragments"
ASSETS_DIR = PROJECT_DIR / "assets"
JS_DIR = PROJECT_DIR / "js"

# ============================================================
# CRYPTO UTILITIES
# ============================================================

def sha256_hex(data: str) -> str:
    """SHA-256 hash of a string, returned as hex."""
    return hashlib.sha256(data.encode('utf-8')).hexdigest()

def sha256_bytes(data: str) -> bytes:
    """SHA-256 hash of a string, returned as bytes."""
    return hashlib.sha256(data.encode('utf-8')).digest()

def encrypt_aes_gcm(plaintext: str, password: str) -> dict:
    """Encrypt plaintext using AES-256-GCM with PBKDF2 key derivation.
    Returns dict with salt, iv, ciphertext (all base64-encoded).
    The ciphertext includes the GCM tag appended."""
    salt = os.urandom(16)
    iv = os.urandom(12)
    
    # Derive key using PBKDF2
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=PBKDF2_ITERATIONS,
    )
    key = kdf.derive(password.encode('utf-8'))
    
    # Encrypt with AES-256-GCM
    aesgcm = AESGCM(key)
    ct = aesgcm.encrypt(iv, plaintext.encode('utf-8'), None)  # ciphertext + tag
    
    return {
        "salt": base64.b64encode(salt).decode('ascii'),
        "iv": base64.b64encode(iv).decode('ascii'),
        "ciphertext": base64.b64encode(ct).decode('ascii'),
        "iterations": PBKDF2_ITERATIONS
    }

def encrypt_aes_cbc(plaintext: bytes, key: bytes, iv: bytes) -> bytes:
    """Encrypt with AES-256-CBC (for stego payload)."""
    padder = sym_padding.PKCS7(128).padder()
    padded_data = padder.update(plaintext) + padder.finalize()
    
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    encryptor = cipher.encryptor()
    return encryptor.update(padded_data) + encryptor.finalize()

# ============================================================
# LAYER 1: DOM ELEMENT GENERATION
# ============================================================

def generate_layer1_elements():
    """Generate the hidden DOM elements for Layer 1 puzzle."""
    answer = LAYER_ANSWERS["layer1"]
    
    # Generate real elements with class ψ
    real_elements = []
    for i, char in enumerate(answer):
        ascii_val = ord(char)
        xored = ascii_val ^ XOR_MASK
        hex_val = format(xored, '02x')
        real_elements.append({
            "class": "ψ",
            "data_omega": i,
            "data_delta": hex_val,
            "type": "real"
        })
    
    # Generate decoy elements with similar Greek letter classes
    decoy_classes = ["φ", "θ", "χ", "ξ", "Ω", "λ", "μ", "σ", "π", "ε"]
    decoy_elements = []
    random.seed(42)  # Reproducible
    
    for i in range(500):
        cls = random.choice(decoy_classes)
        omega = random.randint(0, 50)
        delta = format(random.randint(0, 255), '02x')
        decoy_elements.append({
            "class": cls,
            "data_omega": omega,
            "data_delta": delta,
            "type": "decoy"
        })
    
    # Shuffle all elements together
    all_elements = real_elements + decoy_elements
    random.shuffle(all_elements)
    
    # Generate HTML
    html_lines = []
    for elem in all_elements:
        cls = elem["class"]
        omega = elem["data_omega"]
        delta = elem["data_delta"]
        html_lines.append(
            f'<span class="{cls}" data-ω="{omega}" data-Δ="{delta}"></span>'
        )
    
    return "\n".join(html_lines)

# ============================================================
# LAYER 3: CIPHER TEXT GENERATION
# ============================================================

def vigenere_encrypt(plaintext: str, key: str) -> str:
    """Encrypt using Vigenère cipher (letters only, preserve non-alpha)."""
    result = []
    key_upper = key.upper()
    key_idx = 0
    
    for char in plaintext:
        if char.isalpha():
            base = ord('A') if char.isupper() else ord('a')
            shift = ord(key_upper[key_idx % len(key_upper)]) - ord('A')
            encrypted = chr((ord(char) - base + shift) % 26 + base)
            result.append(encrypted)
            key_idx += 1
        else:
            result.append(char)
    
    return ''.join(result)

def rail_fence_encrypt(plaintext: str, rails: int) -> str:
    """Encrypt using Rail Fence cipher."""
    if rails <= 1:
        return plaintext
    
    fence = [[] for _ in range(rails)]
    rail = 0
    direction = 1
    
    for char in plaintext:
        fence[rail].append(char)
        if rail == 0:
            direction = 1
        elif rail == rails - 1:
            direction = -1
        rail += direction
    
    return ''.join(''.join(row) for row in fence)

def caesar_encrypt(plaintext: str, shift: int) -> str:
    """Encrypt using Caesar cipher (letters only, preserve non-alpha and digits)."""
    result = []
    for char in plaintext:
        if char.isalpha():
            base = ord('A') if char.isupper() else ord('a')
            encrypted = chr((ord(char) - base + shift) % 26 + base)
            result.append(encrypted)
        else:
            result.append(char)
    return ''.join(result)

def generate_layer3_ciphers():
    """Generate all cipher texts for Layer 3."""
    
    # Cipher 1: Vigenère with key PHANTOM
    # Plaintext reveals Rail Fence instructions
    plain1 = "THE RAILS NUMBER THREE THE SIGNAL DESCENDS AND RISES DECODE THE NEXT TRANSMISSION WITH RAILS OF THREE"
    cipher1 = vigenere_encrypt(plain1, VIGENERE_KEY)
    
    # Cipher 2: Rail Fence (3 rails)
    # Plaintext reveals the prime calculation puzzle
    plain2 = "THEKEYLIESIINTHESUMOFALLPRIMESBELOWTHEPHANTOMNUMBERFORTYSEVEN"
    cipher2 = rail_fence_encrypt(plain2, 3)
    
    # Cipher 3: Caesar with shift 21 (281 mod 26 = 21, but we shift by +21 to encrypt)
    # Plaintext is the Layer 3 answer
    plain3 = "v1g3n3r3_pr0t0c0l_13"
    cipher3 = caesar_encrypt(plain3, 21)
    
    # Verify: sum of primes below 47
    primes_below_47 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43]
    prime_sum = sum(primes_below_47)
    assert prime_sum == 281, f"Prime sum is {prime_sum}, expected 281"
    assert 281 % 26 == 21, f"281 mod 26 is {281 % 26}, expected 21"
    
    # Verify Caesar decrypt
    decrypted3 = caesar_encrypt(cipher3, -21)
    assert decrypted3 == plain3, f"Caesar decrypt failed: {decrypted3} != {plain3}"
    
    # Verify Vigenère decrypt
    def vigenere_decrypt(ct, key):
        result = []
        key_upper = key.upper()
        key_idx = 0
        for char in ct:
            if char.isalpha():
                base = ord('A') if char.isupper() else ord('a')
                shift = ord(key_upper[key_idx % len(key_upper)]) - ord('A')
                decrypted = chr((ord(char) - base - shift) % 26 + base)
                result.append(decrypted)
                key_idx += 1
            else:
                result.append(char)
        return ''.join(result)
    
    assert vigenere_decrypt(cipher1, VIGENERE_KEY) == plain1
    
    # Verify Rail Fence decrypt
    def rail_fence_decrypt(ciphertext, rails):
        if rails <= 1:
            return ciphertext
        n = len(ciphertext)
        fence = [[] for _ in range(rails)]
        
        # Calculate row lengths
        pattern = []
        rail = 0
        direction = 1
        for i in range(n):
            pattern.append(rail)
            if rail == 0:
                direction = 1
            elif rail == rails - 1:
                direction = -1
            rail += direction
        
        # Fill fence
        idx = 0
        for r in range(rails):
            count = pattern.count(r)
            fence[r] = list(ciphertext[idx:idx+count])
            idx += count
        
        # Read off
        result = []
        counters = [0] * rails
        rail = 0
        direction = 1
        for i in range(n):
            result.append(fence[rail][counters[rail]])
            counters[rail] += 1
            if rail == 0:
                direction = 1
            elif rail == rails - 1:
                direction = -1
            rail += direction
        
        return ''.join(result)
    
    assert rail_fence_decrypt(cipher2, 3) == plain2
    
    return {
        "cipher1": cipher1,
        "cipher1_plaintext": plain1,  # For SOLUTION.md only
        "cipher2": cipher2,
        "cipher2_plaintext": plain2,
        "cipher3": cipher3,
        "cipher3_plaintext": plain3,
        "vigenere_key": VIGENERE_KEY,
        "prime_sum": prime_sum,
        "caesar_shift": 21
    }

# ============================================================
# LAYER 3: ACROSTIC NARRATIVE
# ============================================================

def generate_acrostic_narrative():
    """Generate the 12-paragraph narrative where first letters spell VIGENERESHIFT"""
    # First letters: V-I-G-E-N-E-R-E-S-H-I-F-T (13 letters)
    # Wait, VIGENERESHIFT is 13 letters: V,I,G,E,N,E,R,E,S,H,I,F,T
    paragraphs = [
        "Vast networks of forgotten data pulse beneath the surface of the dying grid. Every transmission we intercept carries fragments of something ancient, something that predates the shutdown protocol by decades. The phantom's signal grows stronger here.",
        "In the deep frequencies, patterns emerge that defy conventional analysis. The waveforms carry a mathematical signature that no known compression algorithm can produce. Something is encoding itself into the static.",
        "Ghostly echoes reverberate through the dead channels, each one a mirror of a transmission that should not exist. The protocol was terminated. The servers were destroyed. Yet the signal persists, defiant against entropy itself.",
        "Every attempt to locate the signal's origin leads to contradictions. The transmission appears to emanate from seventeen different nodes simultaneously, each one reporting coordinates that map to locations that no longer exist on any known network topology.",
        "No standard decryption has yielded results. The intercepted packets use a layered encoding scheme that wraps each fragment in multiple shells of obfuscation. Brute force is futile here — the keyspace is deliberately designed to resist computational attacks.",
        "Encrypted within the deepest layer of each transmission lies a timestamp that predates the internet itself. How this is possible remains the central mystery. The phantom operates outside our understanding of time and protocol.",
        "Researchers who have attempted to analyze the signal's carrier wave report experiencing temporal anomalies — their clocks desynchronize, their logs show entries from dates that haven't occurred. The signal appears to bend causality around itself.",
        "Each fragment we recover seems to decay rapidly once extracted from the carrier wave. The data degrades as if it were designed to exist only within the phantom's transmission medium. Preservation requires techniques we have not yet developed.",
        "Signal analysts have noted that the transmission follows a predictable mathematical pattern, but one that references a branch of number theory that was only formalized in theoretical papers from the late twentieth century.",
        "Hidden within the modulation of the carrier wave, there exists a secondary signal — a whisper beneath the whisper. This sub-signal appears to contain instructions, though their purpose remains opaque to all who have examined them.",
        "Instruments calibrated to detect quantum-level fluctuations in the signal report anomalous readings. The phantom's transmission does not merely carry data — it appears to alter the fundamental properties of the medium through which it travels.",
        "Frequencies that should be impossible to generate with any known hardware appear regularly in the phantom's transmissions. These frequencies correspond to mathematical constants — pi, euler's number, the golden ratio — encoded as resonance patterns.",
        "Terminal analysis confirms that the phantom's signal is accelerating. Each transmission arrives sooner than the last, the intervals shrinking according to a convergent series. Something is approaching. The void gate is opening."
    ]
    return paragraphs

# ============================================================
# STEGANOGRAPHY
# ============================================================

def embed_lsb_channel(img_array, channel_idx, bit_idx, data: bytes):
    """Embed data into a specific channel and bit position of an image.
    
    channel_idx: 0=R, 1=G, 2=B
    bit_idx: 0=LSB, 1=second bit, etc.
    data: bytes to embed (prefixed with 4-byte length)
    """
    height = len(img_array)
    width = len(img_array[0])
    
    # Prefix data with 32-bit big-endian length
    length_bytes = struct.pack('>I', len(data))
    full_data = length_bytes + data
    
    # Convert to bits
    bits = []
    for byte in full_data:
        for b in range(7, -1, -1):
            bits.append((byte >> b) & 1)
    
    # Check capacity
    capacity = height * width
    if len(bits) > capacity:
        raise ValueError(f"Data too large for image: {len(bits)} bits > {capacity} pixels")
    
    # Embed bits
    bit_mask = ~(1 << bit_idx) & 0xFF
    bit_count = 0
    for y in range(height):
        for x in range(width):
            if bit_count >= len(bits):
                break
            pixel = list(img_array[y][x])
            pixel[channel_idx] = (pixel[channel_idx] & bit_mask) | (bits[bit_count] << bit_idx)
            img_array[y][x] = tuple(pixel)
            bit_count += 1
        if bit_count >= len(bits):
            break
    
    return img_array

def create_stego_image(base_image_path: str, output_path: str, layer1_answer: str, layer2_answer: str):
    """Create the steganographic image with multi-channel data."""
    
    # Load and prepare base image
    img = Image.open(base_image_path).convert('RGB')
    
    # Resize to something reasonable (800x800 gives 640000 pixels = 80KB per channel)
    img = img.resize((800, 800), Image.Resampling.LANCZOS)
    
    # Convert to mutable array
    pixels = []
    for y in range(img.height):
        row = []
        for x in range(img.width):
            row.append(list(img.getpixel((x, y))))
        pixels.append(row)
    
    # === Red Channel LSB (bit 0) — RED HERRING ===
    red_herring_1 = b"STATIC. NOISE. YOU ARE CHASING ECHOES IN A DEAD SIGNAL. THE PHANTOM DOES NOT SPEAK IN RED."
    pixels = embed_lsb_channel(pixels, 0, 0, red_herring_1)
    
    # === Green Channel LSB (bit 0) — RED HERRING ===
    red_herring_2 = b"THE PHANTOM DOES NOT LIVE IN LIGHT. SEEK THE DEEPER SPECTRUM. THE VOID AWAITS BELOW."
    pixels = embed_lsb_channel(pixels, 1, 0, red_herring_2)
    
    # === Blue Channel, Bit 1 — REAL DATA ===
    # Encrypt Layer 2 answer using AES-256-CBC with key derived from Layer 1 answer
    l1_hash = sha256_bytes(layer1_answer)  # 32 bytes = AES-256 key
    aes_key = l1_hash[:32]
    aes_iv = os.urandom(16)
    
    plaintext = layer2_answer.encode('utf-8')
    ciphertext = encrypt_aes_cbc(plaintext, aes_key, aes_iv)
    
    # Format: IV (16 bytes) + ciphertext
    stego_payload = aes_iv + ciphertext
    
    # Base64 encode the payload (so it's recognizable when extracted)
    stego_b64 = base64.b64encode(stego_payload)
    
    # Add a subtle marker prefix so it's identifiable
    stego_data = b"0xPH:" + stego_b64
    
    pixels = embed_lsb_channel(pixels, 2, 1, stego_data)
    
    # Write image
    out_img = Image.new('RGB', (img.width, img.height))
    for y in range(img.height):
        for x in range(img.width):
            out_img.putpixel((x, y), tuple(pixels[y][x]))
    
    out_img.save(output_path, 'PNG')
    
    # Return the stego details for verification
    return {
        "aes_key_hex": aes_key.hex(),
        "aes_iv_hex": aes_iv.hex(),
        "payload_b64": stego_b64.decode('ascii'),
        "full_stego_data": stego_data.decode('ascii'),
        "payload_length": len(stego_data)
    }

# ============================================================
# MAIN BUILD
# ============================================================

def main():
    print("=" * 60)
    print("0xPh4nt0m CTF — Master Build Script")
    print("=" * 60)
    
    # Verify flag integrity
    assert FLAG == f"0xPh4nt0m{{{FRAGMENTS['f1']}{FRAGMENTS['f2']}{FRAGMENTS['f3']}{FRAGMENTS['f4']}}}"
    print(f"\n[✓] Flag verified: {FLAG}")
    
    # --- Step 1: Compute SHA-256 hashes ---
    print("\n[1] Computing SHA-256 verification hashes...")
    layer_hashes = {}
    for layer, answer in LAYER_ANSWERS.items():
        h = sha256_hex(answer)
        layer_hashes[layer] = h
        print(f"    {layer}: SHA-256(\"{answer}\") = {h}")
    
    # --- Step 2: Encrypt flag fragments ---
    print("\n[2] Encrypting flag fragments with AES-256-GCM + PBKDF2...")
    encrypted_fragments = {}
    
    # F1, F2, F3: encrypted with their respective layer answers
    for i, (fkey, fval) in enumerate(list(FRAGMENTS.items())[:3], 1):
        layer_key = f"layer{i}"
        answer = LAYER_ANSWERS[layer_key]
        enc = encrypt_aes_gcm(fval, answer)
        encrypted_fragments[fkey] = enc
        print(f"    {fkey} (\"{fval}\") encrypted with \"{answer}\"")
    
    # F4: encrypted with master key derived from all 3 answers
    master_input = ":".join(LAYER_ANSWERS[f"layer{i}"] for i in range(1, 4))
    master_key_hex = sha256_hex(master_input)
    print(f"\n    Master key input: \"{master_input}\"")
    print(f"    Master key SHA-256: {master_key_hex}")
    
    # For F4, use the master key directly (not PBKDF2) — use raw SHA-256 as AES key
    master_key = bytes.fromhex(master_key_hex)
    f4_iv = os.urandom(12)
    f4_salt = os.urandom(16)  # Not used in derivation but stored for format consistency
    aesgcm = AESGCM(master_key)
    f4_ct = aesgcm.encrypt(f4_iv, FRAGMENTS["f4"].encode('utf-8'), None)
    
    encrypted_fragments["f4"] = {
        "salt": base64.b64encode(f4_salt).decode('ascii'),
        "iv": base64.b64encode(f4_iv).decode('ascii'),
        "ciphertext": base64.b64encode(f4_ct).decode('ascii'),
        "iterations": 0,  # 0 indicates raw key, not PBKDF2
        "master": True
    }
    print(f"    f4 (\"{FRAGMENTS['f4']}\") encrypted with master key")
    
    # Save fragment files
    for fkey, fdata in encrypted_fragments.items():
        fpath = FRAGMENTS_DIR / f"{fkey}.json"
        with open(fpath, 'w') as f:
            json.dump(fdata, f, indent=2)
        print(f"    Saved {fpath}")
    
    # --- Step 3: Generate Layer 1 DOM elements ---
    print("\n[3] Generating Layer 1 hidden DOM elements...")
    dom_html = generate_layer1_elements()
    dom_path = PROJECT_DIR / "build" / "layer1_elements.html"
    with open(dom_path, 'w', encoding='utf-8') as f:
        f.write(dom_html)
    print(f"    Generated {len(LAYER_ANSWERS['layer1'])} real + 500 decoy elements")
    print(f"    XOR mask: 0x{XOR_MASK:02X} ({XOR_MASK})")
    print(f"    Saved {dom_path}")
    
    # --- Step 4: Generate Layer 3 cipher texts ---
    print("\n[4] Generating Layer 3 cipher texts...")
    ciphers = generate_layer3_ciphers()
    print(f"    Cipher 1 (Vigenère, key={ciphers['vigenere_key']}):")
    print(f"      Plain:  {ciphers['cipher1_plaintext']}")
    print(f"      Cipher: {ciphers['cipher1']}")
    print(f"    Cipher 2 (Rail Fence, 3 rails):")
    print(f"      Plain:  {ciphers['cipher2_plaintext']}")
    print(f"      Cipher: {ciphers['cipher2']}")
    print(f"    Cipher 3 (Caesar, shift={ciphers['caesar_shift']}):")
    print(f"      Plain:  {ciphers['cipher3_plaintext']}")
    print(f"      Cipher: {ciphers['cipher3']}")
    print(f"    Prime sum verification: {ciphers['prime_sum']} mod 26 = {ciphers['prime_sum'] % 26}")
    
    # Generate acrostic narrative
    narrative = generate_acrostic_narrative()
    acrostic = ''.join(p[0] for p in narrative)
    print(f"\n    Acrostic from narrative first letters: {acrostic}")
    assert acrostic == "VIGENERESHIFT" or acrostic.startswith("VIGENERE"), f"Acrostic mismatch: {acrostic}"
    
    # --- Step 5: Steganographic image ---
    stego_info = None
    if BASE_IMAGE_PATH and os.path.exists(BASE_IMAGE_PATH):
        print(f"\n[5] Creating steganographic image from {BASE_IMAGE_PATH}...")
        stego_output = ASSETS_DIR / "phantom_signal.png"
        stego_info = create_stego_image(
            BASE_IMAGE_PATH,
            str(stego_output),
            LAYER_ANSWERS["layer1"],
            LAYER_ANSWERS["layer2"]
        )
        print(f"    Red channel  LSB: Red herring message embedded")
        print(f"    Green channel LSB: Red herring message embedded")
        print(f"    Blue channel  bit 1: Real payload embedded ({stego_info['payload_length']} bytes)")
        print(f"    AES key (SHA-256 of L1 answer): {stego_info['aes_key_hex']}")
        print(f"    AES IV: {stego_info['aes_iv_hex']}")
        print(f"    Saved {stego_output}")
    else:
        print("\n[5] SKIPPED — No base image provided. Run with: python generate_all.py <image_path>")
    
    # --- Step 6: Generate JS config file ---
    print("\n[6] Generating JavaScript configuration...")
    
    js_config = f"""// AUTO-GENERATED BY BUILD SCRIPT — DO NOT EDIT
// All values are cryptographically secure — no plaintext secrets
const PHANTOM_CONFIG = {{
    // SHA-256 verification hashes (irreversible)
    hashes: {{
        layer1: "{layer_hashes['layer1']}",
        layer2: "{layer_hashes['layer2']}",
        layer3: "{layer_hashes['layer3']}"
    }},
    
    // Master key derivation method
    // master_key = SHA-256(answer1 + ":" + answer2 + ":" + answer3)
    // Used raw (not PBKDF2) to decrypt fragment 4
    
    // PBKDF2 iterations for fragment decryption
    pbkdf2Iterations: {PBKDF2_ITERATIONS},
    
    // XOR parameters for Layer 1 DOM puzzle
    layer1: {{
        targetClass: "\\u03C8",  // ψ (Greek small letter psi)
        orderAttr: "data-\\u03C9",  // data-ω
        valueAttr: "data-\\u0394",  // data-Δ
        xorMask: {XOR_MASK}
    }},
    
    // Layer 3 cipher texts
    layer3: {{
        cipher1: "{ciphers['cipher1']}",
        cipher2: "{ciphers['cipher2']}",
        cipher3: "{ciphers['cipher3']}"
    }},
    
    // Stego image info (public — no secrets)
    layer2: {{
        imageFile: "assets/phantom_signal.png",
        // Players must extract and decrypt externally
        // Key derivation: SHA-256(Layer1_answer)[:32] = AES-256-CBC key
        // Format: Base64(IV + ciphertext), preceded by "0xPH:" marker
        // Extraction: Blue channel, bit index 1
    }}
}};
"""
    
    config_path = JS_DIR / "config.js"
    with open(config_path, 'w', encoding='utf-8') as f:
        f.write(js_config)
    print(f"    Saved {config_path}")
    
    # --- Step 7: Build report ---
    print("\n" + "=" * 60)
    print("BUILD COMPLETE — Summary")
    print("=" * 60)
    print(f"\nFlag: {FLAG}")
    print(f"Fragments: {FRAGMENTS}")
    print(f"\nLayer answers:")
    for layer, answer in LAYER_ANSWERS.items():
        print(f"  {layer}: {answer}")
    print(f"\nFiles generated:")
    print(f"  fragments/f1.json - f4.json")
    print(f"  build/layer1_elements.html")
    print(f"  js/config.js")
    if stego_info:
        print(f"  assets/phantom_signal.png")
    
    # --- Step 8: Security self-check ---
    print("\n" + "=" * 60)
    print("SECURITY AUDIT")
    print("=" * 60)
    
    # Check that no plaintext secrets appear in deployed files
    deployed_files = [config_path]
    for fkey in FRAGMENTS:
        deployed_files.append(FRAGMENTS_DIR / f"{fkey}.json")
    
    secrets_to_check = [FLAG] + list(LAYER_ANSWERS.values()) + list(FRAGMENTS.values())
    
    all_clear = True
    for fpath in deployed_files:
        if fpath.exists():
            content = open(fpath, 'r').read()
            for secret in secrets_to_check:
                if secret in content:
                    print(f"  [✗] SECURITY VIOLATION: '{secret}' found in {fpath.name}")
                    all_clear = False
    
    if all_clear:
        print("  [✓] No plaintext secrets found in any deployed file")
    
    print("\n[✓] Build complete. Ready for frontend integration.")
    
    # Save build info for SOLUTION.md
    build_info = {
        "flag": FLAG,
        "fragments": FRAGMENTS,
        "layer_answers": LAYER_ANSWERS,
        "layer_hashes": layer_hashes,
        "xor_mask": XOR_MASK,
        "ciphers": {k: v for k, v in ciphers.items()},
        "narrative_acrostic": acrostic,
        "stego_info": stego_info,
        "master_key_input": master_input,
        "master_key_hex": master_key_hex
    }
    
    build_info_path = PROJECT_DIR / "build" / "build_info.json"
    with open(build_info_path, 'w') as f:
        json.dump(build_info, f, indent=2)
    print(f"\nBuild info saved to {build_info_path} (for SOLUTION.md generation)")

if __name__ == "__main__":
    main()
