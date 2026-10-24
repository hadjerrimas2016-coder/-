// Background Audio Player & Media Session Manager for Mobile Lock-Screen Controls
import { notifyStoryPlayback } from './notifications';

class BackgroundAudioManager {
  private audioEl: HTMLAudioElement | null = null;
  private currentTitle: string = '';
  private currentArtist: string = 'منصة رائد للأطفال';
  private isPlayingAudio: boolean = false;
  private onPlaybackStateChange: ((isPlaying: boolean) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
    }
  }

  private initAudio() {
    if (this.audioEl) return;
    this.audioEl = new Audio();
    this.audioEl.preload = 'auto';

    // Loop a gentle soft silent/ambient carrier if needed for web speech on lock screen
    this.audioEl.addEventListener('play', () => {
      this.isPlayingAudio = true;
      this.updateMediaSessionState('playing');
      if (this.onPlaybackStateChange) this.onPlaybackStateChange(true);
    });

    this.audioEl.addEventListener('pause', () => {
      this.isPlayingAudio = false;
      this.updateMediaSessionState('paused');
      if (this.onPlaybackStateChange) this.onPlaybackStateChange(false);
    });

    this.audioEl.addEventListener('ended', () => {
      this.isPlayingAudio = false;
      this.updateMediaSessionState('none');
      if (this.onPlaybackStateChange) this.onPlaybackStateChange(false);
    });

    this.setupMediaSessionHandlers();
  }

  private setupMediaSessionHandlers() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        this.resume();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        this.pause();
      });

      navigator.mediaSession.setActionHandler('stop', () => {
        this.stop();
      });

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        if (this.audioEl && this.audioEl.duration) {
          const skip = details.seekOffset || 10;
          this.audioEl.currentTime = Math.max(this.audioEl.currentTime - skip, 0);
        }
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        if (this.audioEl && this.audioEl.duration) {
          const skip = details.seekOffset || 10;
          this.audioEl.currentTime = Math.min(this.audioEl.currentTime + skip, this.audioEl.duration);
        }
      });
    } catch (err) {
      console.warn('MediaSession action handler error:', err);
    }
  }

  public setPlaybackCallback(cb: (isPlaying: boolean) => void) {
    this.onPlaybackStateChange = cb;
  }

  public updateMediaSession(title: string, subtitle?: string, artworkUrl?: string) {
    this.currentTitle = title;
    this.currentArtist = subtitle || 'منصة رائد - ركن السُنّة والقصص';

    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        const defaultArtwork = '/assets/aistudio/Capture_d__cran_2026-10-17_165411_ea7c3f60.png';
        navigator.mediaSession.metadata = new MediaMetadata({
          title: this.currentTitle,
          artist: this.currentArtist,
          album: 'حكايات وركن السُنّة للأطفال 🌟',
          artwork: [
            {
              src: artworkUrl || defaultArtwork,
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        });
      } catch (e) {
        console.warn('Could not set MediaMetadata', e);
      }
    }
  }

  private updateMediaSessionState(state: 'playing' | 'paused' | 'none') {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = state;
      } catch {
        // ignore
      }
    }
  }

  // Play audio track (e.g. recitation, recording, or audio file)
  public playTrack(
    src: string,
    metadata: { title: string; subtitle?: string; artworkUrl?: string; loop?: boolean }
  ) {
    this.initAudio();
    if (!this.audioEl) return;

    this.updateMediaSession(metadata.title, metadata.subtitle, metadata.artworkUrl);
    this.audioEl.src = src;
    this.audioEl.loop = !!metadata.loop;

    const playPromise = this.audioEl.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlayingAudio = true;
          this.updateMediaSessionState('playing');
          notifyStoryPlayback(metadata.title, metadata.subtitle);
        })
        .catch((err) => {
          console.warn('Audio play error (user interaction might be needed):', err);
        });
    }
  }

  // Play soothing background ambient track while reading so mobile locks keep playing
  public playAmbientCarrier(metadata: { title: string; subtitle?: string; artworkUrl?: string }) {
    this.initAudio();
    if (!this.audioEl) return;

    this.updateMediaSession(metadata.title, metadata.subtitle, metadata.artworkUrl);
    // Data URI for extremely gentle 2-second looped silence/soft binaural tone that keeps audio session active
    // We can use a lightweight synthesized silent audio loop
    const silentAudioDataUri =
      'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
    this.audioEl.src = silentAudioDataUri;
    this.audioEl.loop = true;
    this.audioEl.play().catch(() => {});
    this.updateMediaSessionState('playing');
    notifyStoryPlayback(metadata.title, metadata.subtitle);
  }

  public pause() {
    if (this.audioEl) {
      this.audioEl.pause();
      this.isPlayingAudio = false;
      this.updateMediaSessionState('paused');
    }
  }

  public resume() {
    if (this.audioEl) {
      this.audioEl.play().catch(console.warn);
      this.isPlayingAudio = true;
      this.updateMediaSessionState('playing');
    }
  }

  public stop() {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
      this.isPlayingAudio = false;
      this.updateMediaSessionState('none');
    }
  }

  public isPlaying(): boolean {
    return this.isPlayingAudio;
  }
}

export const backgroundAudio = new BackgroundAudioManager();
