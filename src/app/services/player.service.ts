import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MusicService } from './music.service';
import { Song } from '../model/song.model';
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}



@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private audioPlayer: HTMLAudioElement = new Audio();
  private ytPlayer?: any;
  private currentSource: 'youtube' | 'cloudinary' | null = null;

  isMiniPlayerOpen$ = new BehaviorSubject<boolean>(false);
   isplayerOpen$ =new BehaviorSubject<boolean>(false);
  isPlaying$ = new BehaviorSubject<boolean>(false);
  currentTime$ = new BehaviorSubject<string>('0:00');
  totalDuration$ = new BehaviorSubject<string>('0:00');
  progress$ = new BehaviorSubject<number>(0);
  volume$ = new BehaviorSubject<number>(1);
  
  constructor(private musicService: MusicService) {
    this.setupAudioEvents();
    this.loadYouTubeIFrameAPI();
    this.handleVisibilityChange();
  }

  private setupAudioEvents() {
    this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
    this.audioPlayer.addEventListener('loadedmetadata', () => this.setDuration());
    this.audioPlayer.addEventListener('ended', () => this.musicService.skipToNext());
    this.audioPlayer.addEventListener('play', () => this.isPlaying$.next(true));
    this.audioPlayer.addEventListener('pause', () => this.isPlaying$.next(false));
  }

  private loadYouTubeIFrameAPI() {
    if (!(window as any)['YT']) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.onload = () => {
        (window as any)['onYouTubeIframeAPIReady'] = () => {
          console.log('YouTube API Loaded');
        };
      };
      document.body.appendChild(script);
    }
  }



  setAudioSource(song: Song) {
    this.pauseAll(); // Stop any previous playback

    if (song.isYt && song.audioUrl) {
      this.currentSource = 'youtube';
      this.loadYouTubePlayer(song.audioUrl);
    } else if (song.audioUrl) {
      this.currentSource = 'cloudinary';
      this.audioPlayer.src = song.audioUrl;
      this.audioPlayer.load();
    } else {
      console.error('Invalid song source:', song);
      return;
    }

    // ✅ Update Media Session API for Cloudinary & YouTube
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title || 'Now Playing',
        artist: song.artist || 'Unknown Artist',
        album: 'VibeSync Player',
        artwork: [{ src: song.imageUrl || 'assets/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }]
      });

      // ✅ Ensure Next & Previous buttons work for both sources
      navigator.mediaSession.setActionHandler('nexttrack', () => this.musicService.skipToNext());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.musicService.skipToPrevious());

      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
    }
  }



  play() {
    this.pauseAll(); // Stop any previous playback

    if (this.currentSource === 'youtube' && this.ytPlayer) {
      this.ytPlayer.playVideo();
    } else {
      this.audioPlayer.play();
    }

    this.isPlaying$.next(true);
    this.sendToServiceWorker('PLAY'); // Notify Service Worker

    // ✅ Set up Media Session API with next/prev buttons
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Now Playing',
        artist: 'VibeSync',
        album: 'VibeSync Player',
        artwork: [
          { src: 'assets/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'assets/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      // ✅ Add Next & Previous Track Controls
      navigator.mediaSession.setActionHandler('nexttrack', () => this.musicService.skipToNext());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.musicService.skipToPrevious());

      // Play/Pause Controls
      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
    }
  }

  private pauseAll() {
    if (this.currentSource === 'youtube' && this.ytPlayer) {
      this.ytPlayer.pauseVideo();
    } else {
      this.audioPlayer.pause();
    }
    this.isPlaying$.next(false);
  }



  pause() {
    if (this.currentSource === 'youtube' && this.ytPlayer) {
      this.ytPlayer.pauseVideo();
    } else {
      this.audioPlayer.pause();
    }
    this.isPlaying$.next(false);
    this.sendToServiceWorker('PAUSE');
  }

  private updateProgress() {
    const currentTime = this.audioPlayer.currentTime;
    const duration = this.audioPlayer.duration || 1;
    this.currentTime$.next(this.formatTime(currentTime));
    this.progress$.next((currentTime / duration) * 100);
  }

  private setDuration() {
    const duration = this.audioPlayer.duration;
    this.totalDuration$.next(this.formatTime(duration));
  }

  private formatTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  private loadYouTubePlayer(videoUrl: string) {
    const videoId = this.extractYouTubeVideoID(videoUrl);
    if (!videoId) return;

    if (this.ytPlayer) {
      this.ytPlayer.loadVideoById(videoId);
    } else if (window['YT'] && window['YT'].Player) {
      this.ytPlayer = new window.YT.Player('youtube-player', {
        height: '0',  // Keep hidden
        width: '0',
        videoId: videoId,
        playerVars: { autoplay: 1, controls: 1, modestbranding: 1 },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
            this.updateYtDuration();
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              this.updateYtProgress();
            } else if (event.data === window.YT.PlayerState.ENDED) {
              this.musicService.skipToNext();
            }
          },
          onError: (event: any) => console.error('YouTube Player Error:', event)
        }
      });
    } else {
      console.error('YouTube API not loaded yet.');
    }
  }





  private extractYouTubeVideoID(url: string): string | null {
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }

  setVolume(volume: number) {
    this.audioPlayer.volume = volume;
  }
  setCurrentTime(time: number) {
  if (this.currentSource === 'youtube' && this.ytPlayer) {
    this.ytPlayer.seekTo(time, true); 
  } else {
    this.audioPlayer.currentTime = time;
  }
}

  private updateYtDuration() {
    if (this.ytPlayer && typeof this.ytPlayer.getDuration === 'function') {
      const duration = this.ytPlayer.getDuration();
      this.totalDuration$.next(this.formatTime(duration));
    }
  }

  private updateYtProgress() {
    const update = () => {
      if (this.ytPlayer && typeof this.ytPlayer.getCurrentTime === 'function') {
        const currentTime = this.ytPlayer.getCurrentTime();
        const duration = this.ytPlayer.getDuration() || 1;
        this.currentTime$.next(this.formatTime(currentTime));
        this.progress$.next((currentTime / duration) * 100);

        if (this.ytPlayer.getPlayerState() === window.YT.PlayerState.PLAYING) {
          requestAnimationFrame(update);
        }
      }
    };
    update();
  }


  private async handleVisibilityChange() {
    document.addEventListener('visibilitychange', async () => {
      if (document.hidden && this.isMobile() && this.isPWA()) {
        console.log("App is in background or phone is locked (PWA Mobile). Enabling PiP...");
        await this.enablePiP();

      }
    });
  }




  private async enablePiP() {
    if (document.pictureInPictureElement) return; // Prevent multiple PiP calls
    console.log("Attempting to enable PiP...");

    if (this.currentSource === 'youtube' && this.ytPlayer?.getIframe) {
      const videoElement = this.ytPlayer.getIframe();

      // ✅ YouTube workaround for PiP (forces native player)
      try {
        videoElement.setAttribute("playsinline", "true"); // Allow inline playback on mobile
        videoElement.setAttribute("allow", "autoplay; picture-in-picture"); // Ensure PiP permission
        videoElement.requestFullscreen(); // Try full-screen mode
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait before PiP
        document.exitFullscreen(); // Exit fullscreen, triggering PiP
        console.log("PiP enabled for YouTube (Workaround)");
      } catch (err) {
        console.error("Failed to enable PiP for YouTube:", err);
      }
    } else if (this.currentSource === 'cloudinary') {
      // ✅ Works natively for Cloudinary audio/video
      if ((this.audioPlayer as any).requestPictureInPicture) {
        try {
          await (this.audioPlayer as any).requestPictureInPicture();
          console.log("PiP enabled for Cloudinary Audio");
        } catch (err) {
          console.error("Failed to enable PiP:", err);
        }
      }
    }
  }








  //serviceWorker

  private sendToServiceWorker(type: 'PLAY' | 'PAUSE') {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type });
    }
  }

  private isMobile(): boolean {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  private isPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches || document.referrer.startsWith('android-app://');
  }






}

