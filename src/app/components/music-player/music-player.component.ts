import { CommonModule, DecimalPipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { Song } from '../../model/song.model';
import { backend } from '../../utils/apiUrls';
import { MusicService } from '../../services/music.service';
import { Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-music-player',
  imports: [CommonModule],
  templateUrl: './music-player.component.html',
  styleUrl: './music-player.component.css',
  providers: [DecimalPipe] 
})
export class MusicPlayerComponent implements OnInit {
  playerService = inject(PlayerService);
  musicService = inject(MusicService);
  router = inject(Router);

  currentSong: Song | null = null;
  isPlaying = false;
  isPlayopen=false;
  currentTime = '0:00';
  totalDuration = '0:00';
  progress = 0;
  volume = 1;

  ngOnInit() {
    this.musicService.currentSong.subscribe(song => {
      if (song) this.updateCurrentSong(song);
    });
    this.playerService.isMiniPlayerOpen$.next(true);

    this.playerService.isPlaying$.subscribe(state => this.isPlaying = state);
    this.playerService.currentTime$.subscribe(time => this.currentTime = time);
    this.playerService.totalDuration$.subscribe(time => this.totalDuration = time);
    this.playerService.progress$.subscribe(progress => this.progress = progress);
    this.playerService.volume$.subscribe(volume => this.volume = volume);
    this.playerService.isplayerOpen$.subscribe((val)=>{
      setTimeout(() => {
      this.isPlayopen = val;
    });
    })
  }

  async updateCurrentSong(song: Song) {
    this.currentSong = song;

    if (song.isYt) {
      this.playerService.setAudioSource(song);
      this.playerService.play();
    } else {
      const audioBlob = await this.musicService.getAudioBlob(song);
      if (audioBlob instanceof Blob) {
        const streamUrl = URL.createObjectURL(audioBlob);
        song.audioUrl = streamUrl;
        this.playerService.setAudioSource(song);
        this.playerService.play();
      }
    }
  }


  togglePlayPause() {
    this.isPlaying ? this.playerService.pause() : this.playerService.play(); // ✅ Fixed missing method
  }

  skipNext() {
    this.musicService.skipToNext();
  }

  skipPrevious() {
    this.musicService.skipToPrevious();
  }

  seek(event: any) {
    this.playerService.setCurrentTime(event.target.value); // ✅ Use public method
  }

  changeVolume(event: any) {
    this.playerService.setVolume(event.target.value); // ✅ Use public method
  }
  openPlay(){
    this.router.navigate(['music']);
  }
}