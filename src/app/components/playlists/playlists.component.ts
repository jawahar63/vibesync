import { Component, HostListener, inject, OnInit } from '@angular/core';
import { MusicService } from '../../services/music.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Song } from '../../model/song.model';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-playlists',
  imports: [CommonModule],
  templateUrl: './playlists.component.html',
  styleUrl: './playlists.component.css'
})
export class PlaylistsComponent implements OnInit {
  songs:Song[]=[];
  playlistName : string | null = '';
  loading = true;
  error = '';

  activatedRoute = inject(ActivatedRoute);
  musicService = inject(MusicService);

  ngOnInit(): void {
    this.playlistName = this.activatedRoute.snapshot.paramMap.get('id');
    if(this.playlistName){
      this.musicService.getPlaylists(this.playlistName).subscribe({
        next:(value:any)=> {
          this.loading = false;
          this.songs=value;
        },
        error:(err)=> {
          this.loading = false;
          this.error = err.error.message;
        },
      })
    }
  }


  play(){
    this.musicService.addSongToQueue(this.songs);
  }
  playSong(song: Song) {
    this.musicService.addsongToQueueCurrent(song);
    this.musicService.updateCurrentSong(song);
  }
  shuffle(){
    this.musicService.addSongToQueueArray(this.songs);
    this.musicService.shuffleQueueComplete();
  }


  toggle(song:Song,event:Event){
      if(!song.showOptions){
        this.toggleOptions(song,event);
      }else
      song.showOptions = !song.showOptions;
    }
  
    toggleOptions(song: any, event: Event) {
        event.stopPropagation();
        this.songs.forEach(s => s.showOptions = false);
        song.showOptions = !song.showOptions;
    }
  
    @HostListener('document:click', ['$event'])
    closeOptions(event: Event) {
        this.songs.forEach(s => s.showOptions = false);
    }
  
      
    addToQueue(song: Song) {
      this.musicService.addSongToQueue(song);
    }
    addtoQueueNext(song: Song){
      this.musicService.addSongToQueueNext(song);
    }
}
