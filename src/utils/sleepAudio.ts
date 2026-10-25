// Web Audio API engine for soothing sleep music & ambient lullabies
// Pure procedural synthesis without external asset dependencies

export interface SleepTrack {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  genre: string;
  durationSec: number;
  description: string;
  gradient: string;
}

export const SLEEP_TRACKS: SleepTrack[] = [
  {
    id: 'moonlight-lullaby',
    title: 'تهويدة ضوء القمر والنجوم',
    subtitle: 'ألحان صندوق الموسيقى السحري وقيثارة الأحلام',
    icon: '🌙',
    genre: 'صندوق موسيقى وهارب',
    durationSec: 1200, // 20 mins
    description: 'نغمات ناعمة تتردد بهدوء كأنها قطرات ضوء تهبط من القمر لتغلف غرفتك بالدفء.',
    gradient: 'from-indigo-950 via-purple-900 to-slate-950',
  },
  {
    id: 'desert-oasis',
    title: 'سكون واحة الرمال الهادئة',
    subtitle: 'نسيم الليل العليل وأوتار العود الدافئة',
    icon: '🏜️',
    genre: 'نسيم دافئ وأوتار شرقية',
    durationSec: 1500, // 25 mins
    description: 'هدوء الواحة تحت قبة السماء الصافية ونسمات الهواء المريحة تساعد على نوم عميق.',
    gradient: 'from-amber-950 via-purple-950 to-indigo-950',
  },
  {
    id: 'ocean-whispers',
    title: 'همس أمواج بحر الأحلام',
    subtitle: 'أمواج البحر الهادئة وبيانو الاسترخاء',
    icon: '🌊',
    genre: 'أمواج وبيانو هادئ',
    durationSec: 1800, // 30 mins
    description: 'حركة مد وجزر منتظمة تهدئ ضربات القلب وتأخذ طفلك إلى عالم الخيال والراحة.',
    gradient: 'from-cyan-950 via-blue-950 to-slate-950',
  },
  {
    id: 'forest-rain',
    title: 'قطرات المطر على نافذة الغابة',
    subtitle: 'مطر ناعم وأجراس الرياح الخشبية',
    icon: '🌧️',
    genre: 'مطر طبيعي وأجراس',
    durationSec: 1200, // 20 mins
    description: 'صوت المطر الرتيب الهادئ يبعث على الأمان ويساعد العقل على الاسترخاء الفوري.',
    gradient: 'from-emerald-950 via-teal-950 to-slate-950',
  },
  {
    id: 'cosmic-slumber',
    title: 'ترنيمة حارس الفضاء الكوني',
    subtitle: 'أنغام سماوية هادئة وأجراس النجوم اللامعة',
    icon: '🚀',
    genre: 'أثير فضائي وأجراس',
    durationSec: 1500, // 25 mins
    description: 'رحلة خيالية ناعمة تسبح بين الكواكب البراقة وتغمر الروح بالسكينة والأمان.',
    gradient: 'from-purple-950 via-indigo-950 to-black',
  },
  {
    id: 'bedtime-story-music',
    title: 'موسيقى قصة النوم: رحلة الغيمة البيضاء',
    subtitle: 'لحن استرخاء بطيء مرافق للحكايات',
    icon: '☁️',
    genre: 'سيمفونية هادئة للحكايات',
    durationSec: 1200, // 20 mins
    description: 'موسيقى خلفية مصممة خصيصاً للاستماع أثناء قراءة أو سرد قصص النوم للأطفال.',
    gradient: 'from-slate-900 via-indigo-950 to-purple-950',
  },
];

class SleepAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning: boolean = false;
  private currentTrackId: string = 'moonlight-lullaby';
  private intervals: number[] = [];
  private activeNodes: (AudioNode | { stop: (time?: number) => void })[] = [];

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.ctx && !this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      const safeVol = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setTargetAtTime(safeVol, this.ctx.currentTime, 0.1);
    }
  }

  public playTrack(trackId: string) {
    this.stop();
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    this.currentTrackId = trackId;
    this.isRunning = true;

    switch (trackId) {
      case 'desert-oasis':
        this.startDesertOasis(ctx);
        break;
      case 'ocean-whispers':
        this.startOceanWaves(ctx);
        break;
      case 'forest-rain':
        this.startForestRain(ctx);
        break;
      case 'cosmic-slumber':
        this.startCosmicSlumber(ctx);
        break;
      case 'bedtime-story-music':
        this.startBedtimeStoryMusic(ctx);
        break;
      case 'moonlight-lullaby':
      default:
        this.startMoonlightLullaby(ctx);
        break;
    }
  }

  public stop() {
    this.isRunning = false;
    // Clear all interval timers
    this.intervals.forEach((id) => clearInterval(id));
    this.intervals = [];

    // Stop and disconnect nodes
    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof node.stop === 'function') {
          node.stop();
        }
        if ('disconnect' in node && typeof (node as AudioNode).disconnect === 'function') {
          (node as AudioNode).disconnect();
        }
      } catch {
        // ignore
      }
    });
    this.activeNodes = [];
  }

  // 1. Moonlight Lullaby: Music box pentatonic arpeggio with soft warm sub-pad
  private startMoonlightLullaby(ctx: AudioContext) {
    if (!this.masterGain) return;

    // Warm background drone pad
    const padOsc = ctx.createOscillator();
    const padGain = ctx.createGain();
    const padFilter = ctx.createBiquadFilter();

    padOsc.type = 'sine';
    padOsc.frequency.setValueAtTime(130.81, ctx.currentTime); // C3
    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(300, ctx.currentTime);

    padGain.gain.setValueAtTime(0.12, ctx.currentTime);
    padOsc.connect(padFilter);
    padFilter.connect(padGain);
    padGain.connect(this.masterGain);
    padOsc.start();

    this.activeNodes.push(padOsc, padGain, padFilter);

    // Pentatonic scale notes (C4, D4, E4, G4, A4, C5, E5)
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 659.25, 783.99];
    let noteIndex = 0;

    const playBell = () => {
      if (!this.isRunning || !this.masterGain) return;
      const freq = scale[noteIndex % scale.length];
      noteIndex = (noteIndex + (Math.random() > 0.4 ? 1 : 2)) % scale.length;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Bell decay envelope
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(ctx.currentTime + 2.5);
    };

    // Trigger gentle notes every 1.6 seconds
    playBell();
    const timer = window.setInterval(playBell, 1600);
    this.intervals.push(timer);
  }

  // 2. Desert Oasis: Warm breeze with subtle low resonance
  private startDesertOasis(ctx: AudioContext) {
    if (!this.masterGain) return;

    // Drone 1: Deep warm root
    const drone1 = ctx.createOscillator();
    const droneGain = ctx.createGain();
    drone1.type = 'sine';
    drone1.frequency.setValueAtTime(110.0, ctx.currentTime); // A2
    droneGain.gain.setValueAtTime(0.15, ctx.currentTime);
    drone1.connect(droneGain);
    droneGain.connect(this.masterGain);
    drone1.start();
    this.activeNodes.push(drone1, droneGain);

    // Drone 2: Fifth
    const drone2 = ctx.createOscillator();
    const drone2Gain = ctx.createGain();
    drone2.type = 'sine';
    drone2.frequency.setValueAtTime(164.81, ctx.currentTime); // E3
    drone2Gain.gain.setValueAtTime(0.08, ctx.currentTime);
    drone2.connect(drone2Gain);
    drone2Gain.connect(this.masterGain);
    drone2.start();
    this.activeNodes.push(drone2, drone2Gain);

    // Soft resonant acoustic chimes
    const chords = [220.0, 246.94, 277.18, 329.63, 369.99, 440.0];
    const playOudChime = () => {
      if (!this.isRunning || !this.masterGain) return;
      const freq = chords[Math.floor(Math.random() * chords.length)];
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(0.07, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.0);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 3.1);
    };

    playOudChime();
    const timer = window.setInterval(playOudChime, 2200);
    this.intervals.push(timer);
  }

  // 3. Ocean Waves: Low frequency rhythmic wave surges with white noise filtering
  private startOceanWaves(ctx: AudioContext) {
    if (!this.masterGain) return;

    // White noise buffer
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, ctx.currentTime);

    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.18, ctx.currentTime);

    noise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.masterGain);
    noise.start();

    this.activeNodes.push(noise, filter, waveGain);

    // LFO to simulate rolling ocean waves (every 6 seconds)
    let waveCycle = 0;
    const waveTimer = window.setInterval(() => {
      if (!this.isRunning || !this.ctx) return;
      waveCycle++;
      const now = this.ctx.currentTime;
      filter.frequency.cancelScheduledValues(now);
      filter.frequency.setValueAtTime(180, now);
      filter.frequency.linearRampToValueAtTime(550, now + 3);
      filter.frequency.linearRampToValueAtTime(180, now + 6);
    }, 6000);
    this.intervals.push(waveTimer);

    // Distant soft piano chime
    const pianoNotes = [329.63, 392.0, 493.88, 587.33];
    const chimeTimer = window.setInterval(() => {
      if (!this.isRunning || !this.masterGain || !this.ctx) return;
      const note = pianoNotes[Math.floor(Math.random() * pianoNotes.length)];
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, this.ctx.currentTime);
      g.gain.setValueAtTime(0.04, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 4.0);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 4.1);
    }, 4500);
    this.intervals.push(chimeTimer);
  }

  // 4. Forest Rain: Soft rhythmic raindrops and gentle wind chime
  private startForestRain(ctx: AudioContext) {
    if (!this.masterGain) return;

    // Soft rain noise
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.setValueAtTime(800, ctx.currentTime);
    rainFilter.Q.setValueAtTime(1.2, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.12, ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(this.masterGain);
    rainSource.start();

    this.activeNodes.push(rainSource, rainFilter, rainGain);

    // Random raindrops
    const dropTimer = window.setInterval(() => {
      if (!this.isRunning || !this.masterGain || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      const baseFreq = 800 + Math.random() * 600;
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.08);

      g.gain.setValueAtTime(0.03, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.09);

      osc.connect(g);
      g.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    }, 280);
    this.intervals.push(dropTimer);
  }

  // 5. Cosmic Slumber: Deep ethereal celestial harmonics
  private startCosmicSlumber(ctx: AudioContext) {
    if (!this.masterGain) return;

    const frequencies = [73.42, 110.0, 146.83, 220.0];
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(0.06 / (idx + 1), ctx.currentTime);
      osc.connect(g);
      g.connect(this.masterGain!);
      osc.start();
      this.activeNodes.push(osc, g);
    });

    // Twinkling celestial star bells
    const starNotes = [587.33, 659.25, 783.99, 880.0, 1046.5];
    const starTimer = window.setInterval(() => {
      if (!this.isRunning || !this.masterGain || !this.ctx) return;
      const note = starNotes[Math.floor(Math.random() * starNotes.length)];
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, this.ctx.currentTime);
      g.gain.setValueAtTime(0.05, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.2);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 3.3);
    }, 1900);
    this.intervals.push(starTimer);
  }

  // 6. Bedtime Story Music: Slow harmonic chords supporting storytelling
  private startBedtimeStoryMusic(ctx: AudioContext) {
    if (!this.masterGain) return;

    const chords = [
      [261.63, 329.63, 392.0], // C major
      [220.0, 261.63, 329.63], // A minor
      [174.61, 220.0, 261.63], // F major
      [196.0, 246.94, 293.66], // G major
    ];

    let chordIdx = 0;
    const playChord = () => {
      if (!this.isRunning || !this.masterGain || !this.ctx) return;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
        g.gain.setValueAtTime(0.04, this.ctx!.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 5.5);
        osc.connect(g);
        g.connect(this.masterGain!);
        osc.start();
        osc.stop(this.ctx!.currentTime + 5.6);
      });
    };

    playChord();
    const timer = window.setInterval(playChord, 5000);
    this.intervals.push(timer);
  }
}

export const sleepAudioEngine = new SleepAudioEngine();
