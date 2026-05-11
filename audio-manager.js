// Audio Manager for Alexa-Zero
const AudioManager = {
    musicSources: ["./nocturne.mp3"],
    audioContext: null,
    soundEffects: {
        goodChoice: null,
        badChoice: null,
        badChoiceSevere: null,
        neutralChoice: null,
        interrupt: null,
        timeout: null,
        glitch: null,
        error: null,
        typingCalm: null,
        typingAngry: null,
        typingGlitch: null
    },
    currentSoundId: null,
    isPlaying: false,
    volume: 0.25,
    hasStarted: false,

    getAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(() => {});
        }
        return this.audioContext;
    },

    initialize() {
        console.log("Audio system initializing...");
        this.getAudioContext();
        this.createSoundEffects();
        const musicBtn = document.getElementById("music-btn");
        if (musicBtn) {
            musicBtn.textContent = "?? MUSIC: OFF";
            musicBtn.style.cursor = "pointer";
            musicBtn.onclick = (e) => {
                e.stopPropagation();
                this.toggleMusic();
            };
        }
        document.addEventListener("click", () => {
            if (!this.hasStarted) {
                this.hasStarted = true;
            }
            this.getAudioContext();
        });
    },

    createSoundEffects() {
        this.soundEffects.goodChoice = this.create8BitSound([330, 392], 0.16, "triangle");
        this.soundEffects.badChoice = this.create8BitSound([220, 196], 0.18, "triangle");
        this.soundEffects.badChoiceSevere = this.create8BitSound([175, 156], 0.24, "sawtooth");
        this.soundEffects.neutralChoice = this.create8BitSound([440], 0.12, "sine");
        this.soundEffects.interrupt = this.create8BitSound([520, 440], 0.12, "triangle");
        this.soundEffects.timeout = this.create8BitSound([262, 196], 0.28, "triangle");
        this.soundEffects.glitch = this.createGlitchSound();
        this.soundEffects.error = this.create8BitSound([150, 120], 0.32, "triangle");
        this.soundEffects.typingCalm = this.createTypingSound(620, 0.055, "sine");
        this.soundEffects.typingAngry = this.createTypingSound(520, 0.045, "triangle");
        this.soundEffects.typingGlitch = this.createTypingGlitchSound();
    },

    create8BitSound(frequencies, duration, waveType) {
        return {
            play: () => {
                try {
                    const audioContext = this.getAudioContext();
                    frequencies.forEach((freq, index) => {
                        setTimeout(() => {
                            const oscillator = audioContext.createOscillator();
                            const gainNode = audioContext.createGain();
                            oscillator.connect(gainNode);
                            gainNode.connect(audioContext.destination);
                            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                            oscillator.type = waveType;
                            gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.005, audioContext.currentTime + duration);
                            oscillator.start(audioContext.currentTime);
                            oscillator.stop(audioContext.currentTime + duration);
                        }, index * duration * 1000);
                    });
                } catch (e) {
                    console.warn("Audio error:", e);
                }
            }
        };
    },

    createGlitchSound() {
        return {
            play: () => {
                try {
                    const audioContext = this.getAudioContext();
                    for (let i = 0; i < 4; i++) {
                        setTimeout(() => {
                            const oscillator = audioContext.createOscillator();
                            const gainNode = audioContext.createGain();
                            oscillator.connect(gainNode);
                            gainNode.connect(audioContext.destination);
                            oscillator.frequency.setValueAtTime(200 + Math.random() * 300, audioContext.currentTime);
                            oscillator.type = "triangle";
                            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.003, audioContext.currentTime + 0.05);
                            oscillator.start(audioContext.currentTime);
                            oscillator.stop(audioContext.currentTime + 0.05);
                        }, i * 60);
                    }
                } catch (e) {
                    console.warn("Glitch error:", e);
                }
            }
        };
    },

    createTypingSound(baseFreq = 800, duration = 0.03, waveType = "square") {
        return {
            play: () => {
                try {
                    const audioContext = this.getAudioContext();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    oscillator.frequency.setValueAtTime(baseFreq + Math.random() * 50, audioContext.currentTime);
                    oscillator.type = waveType;
                    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.003, audioContext.currentTime + duration);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + duration);
                } catch (e) {
                    console.warn("Typing error:", e);
                }
            }
        };
    },

    createTypingGlitchSound() {
        return {
            play: () => {
                try {
                    const audioContext = this.getAudioContext();
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => {
                            const oscillator = audioContext.createOscillator();
                            const gainNode = audioContext.createGain();
                            oscillator.connect(gainNode);
                            gainNode.connect(audioContext.destination);
                            oscillator.frequency.setValueAtTime(520 + Math.random() * 200, audioContext.currentTime);
                            oscillator.type = "triangle";
                            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.003, audioContext.currentTime + 0.04);
                            oscillator.start(audioContext.currentTime);
                            oscillator.stop(audioContext.currentTime + 0.04);
                        }, i * 35);
                    }
                } catch (e) {
                    console.warn("Typing glitch error:", e);
                }
            }
        };
    },

    playSound(soundName) {
        if (this.soundEffects[soundName]) {
            this.soundEffects[soundName].play();
        }
    },
    
    playBackgroundMusic() {
        if (this.isPlaying && this.currentSoundId) return;
        if (!window.Howl) {
            console.error("Howler.js not loaded");
            return;
        }
        const randomMusic = this.musicSources[0];
        if (this.currentSoundId) this.currentSoundId.stop();
        
        this.currentSoundId = new Howl({
            src: [randomMusic],
            autoplay: true,
            loop: true,
            volume: this.volume,
            html5: true,
            onplay: () => {
                this.isPlaying = true;
                this.updateButtonUI(true);
                console.log("Music playing");
            },
            onpause: () => {
                this.isPlaying = false;
                this.updateButtonUI(false);
            },
            onstop: () => {
                this.isPlaying = false;
                this.updateButtonUI(false);
            },
            onerror: () => {
                console.error("Audio error:", randomMusic);
                this.isPlaying = false;
                this.updateButtonUI(false);
            }
        });
    },
    
    toggleMusic() {
        if (!this.currentSoundId) {
            this.playBackgroundMusic();
        } else if (this.isPlaying) {
            this.currentSoundId.pause();
            this.isPlaying = false;
            this.updateButtonUI(false);
        } else {
            this.currentSoundId.play();
            this.isPlaying = true;
            this.updateButtonUI(true);
        }
    },
    
    updateButtonUI(playing) {
        const musicBtn = document.getElementById("music-btn");
        if (musicBtn) {
            musicBtn.textContent = playing ? "?? Music: ON" : "?? Music: OFF";
        }
    },
    
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.currentSoundId) {
            this.currentSoundId.volume(this.volume);
        }
    }
};

if (typeof window !== 'undefined') {
    window.AudioManager = AudioManager;
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => AudioManager.initialize());
} else {
    AudioManager.initialize();
}
