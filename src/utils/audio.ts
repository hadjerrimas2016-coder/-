// Web Audio API synthesizer for playful, instant sound effects without external assets

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const setSoundMuted = (muted: boolean) => {
  soundEnabled = !muted;
  if (muted) {
    stopArabicSpeech();
  }
};

export const getSoundEnabled = () => soundEnabled;

export const playPopSound = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.1);
  } catch (e) {
    console.error(e);
  }
};

export const playSparkleSound = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
    const now = ctx.currentTime;
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      
      gain.gain.setValueAtTime(0.2, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.26);
    });
  } catch (e) {
    console.error(e);
  }
};

export const playFanfareSound = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const chords = [
      { freq: 440, time: 0, dur: 0.15 },
      { freq: 554.37, time: 0.15, dur: 0.15 },
      { freq: 659.25, time: 0.3, dur: 0.2 },
      { freq: 880, time: 0.5, dur: 0.45 },
    ];
    const now = ctx.currentTime;
    
    chords.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);
      
      gain.gain.setValueAtTime(0.25, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } catch (e) {
    console.error(e);
  }
};

export const playClickSound = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) {
    console.error(e);
  }
};

export const playCorrectSound = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [659.25, 880].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.2, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.2);
    });
  } catch (e) {
    console.error(e);
  }
};

export const playWrongSound = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(130, now + 0.2);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch (e) {
    console.error(e);
  }
};

// Web Speech API for Arabic Story Narration
export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  voiceTone?: 'friendly' | 'joyful' | 'encouraging';
  lang?: string;
}

// Web Speech API for Arabic Story Narration
let currentUtterance: SpeechSynthesisUtterance | null = null;

export const speakArabicSpeech = (
  text: string, 
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void,
  options?: SpeechOptions
) => {
  if (!soundEnabled) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }
  
  stopArabicSpeech();

  // Strip complex symbols that might confuse the engine, keeping vocalized Arabic tashkeel intact
  const sanitizedText = text.replace(/[\*\#\_]/g, '');
  const utterance = new SpeechSynthesisUtterance(sanitizedText);
  utterance.lang = options?.lang || 'ar-SA';
  
  // Configure tone adjustments
  let baseRate = options?.rate || 0.9;
  let basePitch = options?.pitch || 1.1;

  if (options?.voiceTone === 'joyful') {
    basePitch = 1.25;
    baseRate = (options?.rate || 0.95) * 1.05;
  } else if (options?.voiceTone === 'encouraging') {
    basePitch = 1.15;
    baseRate = (options?.rate || 0.9) * 1.0;
  } else if (options?.voiceTone === 'friendly') {
    basePitch = 1.05;
    baseRate = (options?.rate || 0.88);
  }

  utterance.rate = baseRate;
  utterance.pitch = basePitch;

  // Try finding best Arabic voice if available in user's browser
  const voices = window.speechSynthesis.getVoices();
  const arVoice = voices.find(v => 
    v.lang.startsWith('ar') || 
    v.lang.includes('AR') || 
    v.name.toLowerCase().includes('arabic') || 
    v.name.includes('Maged') || 
    v.name.includes('Laila') || 
    v.name.includes('Tarik') ||
    v.name.includes('Hoda')
  );
  if (arVoice) {
    utterance.voice = arVoice;
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    // Only warn if not manually cancelled
    if (e.error !== 'canceled' && e.error !== 'interrupted') {
      console.warn('SpeechSynthesis error:', e);
      if (onError) onError();
    }
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  currentUtterance = utterance;
  
  // Workaround for browser speech engine pausing on longer texts
  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('SpeechSynthesis invocation error:', err);
    if (onEnd) onEnd();
  }
};

export const stopArabicSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
  currentUtterance = null;
};
