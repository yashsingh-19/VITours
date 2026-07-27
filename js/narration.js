/* ============================================================
   NARRATION.JS
   Wraps the browser's built-in speech synthesis (Web Speech API)
   to narrate each scene, drive the caption bar, and report
   progress so the UI can show a play/pause + progress fill.
   No external API key or network call needed — voices are
   provided by the OS/browser itself.
   ============================================================ */

class Narrator {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.supported = !!this.synth;
    this.voice = null;
    this.utter = null;
    this.enabled = true;
    this.onStart = null;
    this.onEnd = null;
    this.onBoundary = null; // (charIndex, charLength)

    if (this.supported) {
      this._pickVoice();
      // Voices load async in some browsers
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this._pickVoice();
      }
    }
  }

  _pickVoice() {
    const voices = this.synth.getVoices();
    if (!voices || !voices.length) return;
    // Prefer a clear English voice; favor "Google UK English Female/Male" or
    // any en-IN / en-GB / en-US voice, in that rough order of preference.
    const prefs = [
      v => /en-IN/i.test(v.lang) && /Google/i.test(v.name),
      v => /en-GB/i.test(v.lang) && /Google/i.test(v.name),
      v => /en-US/i.test(v.lang) && /Google/i.test(v.name),
      v => /en-IN/i.test(v.lang),
      v => /en-GB/i.test(v.lang),
      v => /en-US/i.test(v.lang),
      v => /^en/i.test(v.lang)
    ];
    for (const test of prefs) {
      const match = voices.find(test);
      if (match) { this.voice = match; return; }
    }
    this.voice = voices[0];
  }

  speak(text) {
    if (!this.supported || !this.enabled) {
      if (this.onEnd) this.onEnd();
      return;
    }
    this.stop();
    const u = new SpeechSynthesisUtterance(text);
    if (this.voice) u.voice = this.voice;
    u.rate = 0.98;
    u.pitch = 1.0;
    u.volume = 1.0;

    u.onstart = () => { if (this.onStart) this.onStart(); };
    u.onend = () => { if (this.onEnd) this.onEnd(); };
    u.onerror = () => { if (this.onEnd) this.onEnd(); };
    u.onboundary = (e) => { if (this.onBoundary) this.onBoundary(e.charIndex, text.length); };

    this.utter = u;
    // Small timeout helps some browsers (esp. Chrome) reliably fire after stop()
    setTimeout(() => this.synth.speak(u), 30);
  }

  pause() {
    if (this.supported && this.synth.speaking && !this.synth.paused) this.synth.pause();
  }
  resume() {
    if (this.supported && this.synth.paused) this.synth.resume();
  }
  stop() {
    if (this.supported) this.synth.cancel();
  }
  toggleEnabled() {
    this.enabled = !this.enabled;
    if (!this.enabled) this.stop();
    return this.enabled;
  }
}
