import { Component, HostListener, inject } from '@angular/core';
import { MusicPlayerComponent } from '../../components/music-player/music-player.component';
import { CommonModule } from '@angular/common';
import { UploadComponent } from '../../components/upload/upload.component';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MusicService } from '../../services/music.service';
import { Song } from '../../model/song.model';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { playlist } from '../../model/playList.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule,FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  songs: Song[] = [];
  playlists: Song[] = [];
  currentSong: any = null;
  selectedFiles: File[] = [];
  filteredSongs: any[] = [];
  searchQuery: string = '';
  isAdmin = false;
  playList:playlist[]=[
    {
      name:"Frequently heared",
      url:"frequent"
    },
    {
      name:"Recently played",
      url:"recently-played"
    },
    {
      name:"Top genres",
      url:"top-genres"
    },
    {
      name:"history",
      url:"history"
    },
    {
      name:"Top artists",
      url:"top-artists"
    },
    {
      name:"Newly added song",
      url:"new-additions"
    },
    
    

]

    private musicServies=inject(MusicService);
    router =inject(Router)

  ngOnInit() {
    this.fetchSongs();
  }
  fetchSongs() {
    this.musicServies.getSongsCloud(" ").subscribe((data: any) => {
      this.songs = data;
      this.filteredSongs = data;
    });
  }


  filterSongs() {
    if (this.searchQuery.trim()) {
      this.musicServies.getSongsCloud(this.searchQuery).subscribe((data: any) => {
        this.filteredSongs = data;
      });
    } else {
      this.filteredSongs = this.songs;
    }
  }

  playSong(song: Song) {
    this.musicServies.addsongToQueueCurrent(song);
    this.musicServies.updateCurrentSong(song);
  }
  uploadSongs(event:any){
    this.selectedFiles = Array.from(event.target.files);
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
    this.musicServies.addSongToQueue(song);
  }
  addtoQueueNext(song: Song){
    this.musicServies.addSongToQueueNext(song);
  }

  goToPlaylist(name:string){
    this.router.navigate(['home/playlist/'+name]);
  }
}
