import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Song } from '../../model/song.model';
import { MusicService } from '../../services/music.service';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';




@Component({
  selector: 'app-queue',
  imports: [CommonModule],
  templateUrl: './queue.component.html',
  styleUrl: './queue.component.css',
  animations: [
    trigger('slideAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ transform: 'translateX(0%)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ transform: 'translateX(-200%)', opacity: 0 }))
      ])
    ]),
    trigger('slideRAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ transform: 'translateX(0%)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ transform: 'translateX(200%)', opacity: 0 }))
      ])
    ]),
  ]
})
export class QueueComponent implements OnInit {

  songs:Song[]=[];
  history:Song[]=[];
  current:Song|null=null;
  currentQueue = 'next';
  animationClass = '';
  loading:boolean=false;

  showQueue = true;
  moveDirection = 'move-left';

  musicService = inject(MusicService);

  ngOnInit() {
    this.musicService.currentSong.subscribe((song) => {
      this.current = song;
    });

    this.musicService.songs.subscribe((queue) => {
      this.songs = queue.iterator();
      this.current = queue.current?.song || null;
    });
    this.musicService.songs.subscribe((queue) => {
      this.history = queue.historyIterator();
      this.current = queue.current?.song || null;
    });

    if(this.songs.length==0){
      this.loading=true;
    }
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

  moveTop(song:Song) { 
    this.musicService.moveTop(song);
  }
  moveUp(song:Song) {
    this.musicService.moveUp(song);
  }
  moveDown(song:Song) {
    this.musicService.moveDown(song);
  }
  moveBottom(song:Song) {
    this.musicService.moveBottom(song);
  }
  deleteSong(song:Song) {
    this.musicService.deleteSong(song);
  }

  changeQueueType(type: string) {
    this.currentQueue=type;
  }
  shuffleQueue(){
    this.musicService.shuffleQueue();
  }


}
