import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { Song } from '../../model/song.model';
import { FormsModule } from '@angular/forms';
import { MusicService } from '../../services/music.service';

@Component({
  selector: 'app-search',
  imports: [CommonModule,FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {

  musicServies=inject(MusicService);

  searchQuery='';
  filteredSongs:Song[]=[];
  noData=false;
  result="";
  searchfrom="lastfm";

  search(){
    if (this.searchQuery.trim()) {
      if(this.searchfrom=='lastfm'){
        this.musicServies.getSongsLast(this.searchQuery).subscribe({
          next:(data:any)=> {
            this.filteredSongs = data;
          },
          error:(err) =>{
            this.result = err.error.message;
          },
        });
      }else{
        this.musicServies.getSongs(this.searchQuery).subscribe((data: any) => {
          this.filteredSongs = data;
          
        });
      }
    } else {
      this.filteredSongs = [];
    }
  }

  toggle(song:Song,event:Event){
      if(!song.showOptions){
        this.toggleOptions(song,event);
      }else
      song.showOptions = !song.showOptions;
    }
  
    toggleOptions(song: Song, event: Event) {
        event.stopPropagation();
        this.filteredSongs.forEach(s => s.showOptions = false);
        song.showOptions = !song.showOptions;
    }
  
    @HostListener('document:click', ['$event'])
    closeOptions(event: Event) {
        this.filteredSongs.forEach(s => s.showOptions = false);
    }

    addtoDB(song:Song){
      this.musicServies.addToDB(song).subscribe({
        next(val) {
          console.log(val);
          alert("added successfully");
        },
        error(err) {
          console.log(err);
        },
      })
    }
    changeSearchType(val:string){
      this.searchfrom = val;
    }
}
