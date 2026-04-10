/**
 * 0xPh4nt0m CTF — Visual Effects
 * Canvas signal waveform, glitch effects, noise bursts, particles
 */

const PhantomEffects = {
    canvas: null,
    ctx: null,
    _animFrame: null,
    _waveOffset: 0,
    _particles: [],
    _noiseTimeout: null,

    /**
     * Initialize the canvas signal waveform
     */
    initCanvas(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this._resizeCanvas();
        window.addEventListener('resize', () => this._resizeCanvas());
        this._initParticles(60);
        this._animate();
    },

    _resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    _initParticles(count) {
        this._particles = [];
        for (let i = 0; i < count; i++) {
            this._particles.push({
                x: Math.random() * (this.canvas?.width || 800),
                y: Math.random() * (this.canvas?.height || 600),
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.3 + 0.1,
                pulse: Math.random() * Math.PI * 2
            });
        }
    },

    _animate() {
        if (!this.ctx || !this.canvas) return;
        
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Clear
        ctx.fillStyle = 'rgba(5, 5, 8, 0.15)';
        ctx.fillRect(0, 0, w, h);

        // Draw signal waveform
        this._drawWaveform(ctx, w, h);
        
        // Draw particles
        this._drawParticles(ctx, w, h);
        
        // Draw grid
        this._drawGrid(ctx, w, h);

        this._waveOffset += 0.02;
        this._animFrame = requestAnimationFrame(() => this._animate());
    },

    _drawWaveform(ctx, w, h) {
        const centerY = h * 0.5;
        const amplitude = h * 0.08;
        
        // Main signal line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.15)';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < w; x += 2) {
            const t = (x / w) * Math.PI * 6 + this._waveOffset;
            const y = centerY + 
                Math.sin(t) * amplitude * 0.6 +
                Math.sin(t * 2.7) * amplitude * 0.3 +
                Math.sin(t * 0.5 + this._waveOffset * 0.7) * amplitude * 0.4 +
                (Math.random() - 0.5) * 3; // noise
            
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Secondary signal (cyan, offset)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
        ctx.lineWidth = 0.5;
        
        for (let x = 0; x < w; x += 3) {
            const t = (x / w) * Math.PI * 4 + this._waveOffset * 1.3;
            const y = centerY + h * 0.15 + 
                Math.sin(t * 1.5) * amplitude * 0.4 +
                Math.cos(t * 0.8) * amplitude * 0.2 +
                (Math.random() - 0.5) * 2;
            
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    },

    _drawParticles(ctx, w, h) {
        for (const p of this._particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.pulse += 0.02;

            // Wrap around
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            const alpha = p.alpha * (0.5 + 0.5 * Math.sin(p.pulse));
            ctx.fillStyle = `rgba(0, 229, 255, ${alpha})`;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }
    },

    _drawGrid(ctx, w, h) {
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.02)';
        ctx.lineWidth = 0.5;

        // Vertical lines
        const gridSpacing = 80;
        for (let x = 0; x < w; x += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y < h; y += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
    },

    /**
     * Trigger a screen shake effect
     */
    shake() {
        const container = document.querySelector('.phantom-container');
        if (container) {
            container.classList.add('shake');
            setTimeout(() => container.classList.remove('shake'), 400);
        }
    },

    /**
     * Trigger a noise burst transition effect
     */
    noiseBurst() {
        const burst = document.createElement('div');
        burst.className = 'noise-burst';
        document.body.appendChild(burst);
        setTimeout(() => burst.remove(), 300);
    },

    /**
     * Success flash on an element
     */
    successFlash(element) {
        if (element) {
            element.classList.add('success-flash');
            setTimeout(() => element.classList.remove('success-flash'), 1000);
        }
    },

    /**
     * Type text into an element character by character
     */
    typeText(element, text, speed = 30) {
        return new Promise(resolve => {
            let i = 0;
            element.textContent = '';
            const interval = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text[i];
                    i++;
                } else {
                    clearInterval(interval);
                    resolve();
                }
            }, speed);
        });
    },

    /**
     * Add a terminal line with typing effect
     */
    async addTerminalLine(container, text, className = '', speed = 15) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        
        if (className) {
            const span = document.createElement('span');
            span.className = className;
            line.appendChild(span);
            container.appendChild(line);
            await this.typeText(span, text, speed);
        } else {
            container.appendChild(line);
            await this.typeText(line, text, speed);
        }
        
        container.scrollTop = container.scrollHeight;
        return line;
    },

    /**
     * Stop all effects
     */
    destroy() {
        if (this._animFrame) {
            cancelAnimationFrame(this._animFrame);
        }
    }
};
