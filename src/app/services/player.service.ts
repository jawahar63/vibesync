import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MusicService } from './music.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private audioPlayer: HTMLAudioElement = new Audio();

  
  isMiniPlayerOpen$ = new BehaviorSubject<boolean>(false);
  isplayerOpen$ =new BehaviorSubject<boolean>(false);
  isPlaying$ = new BehaviorSubject<boolean>(false);
  currentTime$ = new BehaviorSubject<string>('0:00');
  totalDuration$ = new BehaviorSubject<string>('0:00');
  progress$ = new BehaviorSubject<number>(0);
  volume$ = new BehaviorSubject<number>(1); // Default volume at max (1)
  musicServices=inject(MusicService);

  constructor() {
    this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
    this.audioPlayer.addEventListener('loadedmetadata', () => this.setDuration());
    this.audioPlayer.addEventListener('ended', () => this.onSongEnd());

    this.audioPlayer.addEventListener('play', () => this.isPlaying$.next(true));
    this.audioPlayer.addEventListener('pause', () => this.isPlaying$.next(false));
  }

  setAudioSource(src: string) {
    this.audioPlayer.src = src;
    this.audioPlayer.load();
  }

  play() {
    this.audioPlayer.play();
    this.isPlaying$.next(true);
  }

  pause() {
    this.audioPlayer.pause();
    this.isPlaying$.next(false);
  }

  togglePlayPause() {
    this.audioPlayer.paused ? this.play() : this.pause();
  }

  seekTo(percentage: number) {
    const seekTime = (percentage / 100) * this.audioPlayer.duration;
    this.audioPlayer.currentTime = seekTime;
  }

  setVolume(volume: number) {
    this.audioPlayer.volume = volume;
    this.volume$.next(volume);
  }

  private updateProgress() {
    const currentTime = this.audioPlayer.currentTime;
    const duration = this.audioPlayer.duration || 1; // Prevent division by zero
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

  private onSongEnd() {
    console.log('Song ended, implement next song logic.');
    this.musicServices.skipToNext();
  }

}
