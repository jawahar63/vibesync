import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MusicService } from '../../services/music.service';
import { PlayerService } from '../../services/player.service';
import { CommonModule, Location } from '@angular/common';
import { Song } from '../../model/song.model';

@Component({
  selector: 'app-music',
  imports: [CommonModule],
  templateUrl: './music.component.html',
  styleUrl: './music.component.css'
})
export class MusicComponent implements OnInit, OnDestroy {

  musicService = inject(MusicService);
  playerService = inject(PlayerService);
  location = inject(Location);

  currentSong: Song | null = null;
  isPlaying = false;
  currentTime = '0:00';
  totalDuration = '0:00';
  progress = 0;
  volume = 1;

  ngOnInit() {
    this.playerService.isplayerOpen$.next(true);

    this.musicService.currentSong.subscribe(song => {
      if (song) this.currentSong = song;
    });

    this.playerService.isPlaying$.subscribe(state => this.isPlaying = state);
    this.playerService.currentTime$.subscribe(time => this.currentTime = time);
    this.playerService.totalDuration$.subscribe(time => this.totalDuration = time);
    this.playerService.progress$.subscribe(progress => this.progress = progress);
    this.playerService.volume$.subscribe(volume => this.volume = volume);
  }

  ngOnDestroy() {
    this.playerService.isplayerOpen$.next(false);
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
  like(){
    if(this.currentSong){
      this.musicService.like(this.currentSong._id).subscribe({
        next:(value)=> {
          if(this.currentSong?.liked == true)this.currentSong.liked = false;
          else if(this.currentSong?.liked == false)this.currentSong.liked = true;
        },
        error:(err)=> {
          alert('failed');
        },
      })
    }
  }
  back(){
    this.location.back();
  }

  changeVolume(event: any) {
    this.playerService.setVolume(event.target.value);
  }

  getTrackStyle(){
    return `linear-gradient(to right, #3b82f6 ${this.progress}%, #ffffff4e ${this.progress}%)`;
  }
  getVolumeTrackStyle(): string {
    return `linear-gradient(to right, #3b82f6 ${this.volume * 100}%, #ffffff ${this.volume * 100}%)`;
  }


}
