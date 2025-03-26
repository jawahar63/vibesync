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
    
    const audioBlob = await this.musicService.getAudioBlob(song);
    const streamUrl = URL.createObjectURL(audioBlob);

    this.playerService.setAudioSource(streamUrl);
    this.playerService.play();
  }

  togglePlayPause() {
    this.playerService.togglePlayPause();
  }

  skipNext() {
    this.musicService.skipToNext();
  }

  skipPrevious() {
    this.musicService.skipToPrevious();
  }

  seek(event: any) {
    this.playerService.seekTo(event.target.value);
  }

  changeVolume(event: any) {
    this.playerService.setVolume(event.target.value);
  }
  openPlay(){
    this.router.navigate(['music']);
  }
}