import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MusicService } from '../../services/music.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-floating-music-player',
  imports: [CommonModule],
  templateUrl: './floating-music-player.component.html',
  styleUrl: './floating-music-player.component.css'
})
export class FloatingMusicPlayerComponent {

  @ViewChild('pipContainer', { static: false }) pipContainer!: ElementRef<HTMLDivElement>;
  musicPlayerService=inject(MusicService)
  song$ = this.musicPlayerService.currentSong;
  isPlaying$ = this.musicPlayerService.isPlaying$;
  expanded = false;
localStorage: any;
  

  ngOnInit() {
    window.addEventListener('beforeunload', () => {
      localStorage.setItem('playerVisible', 'true');
    });
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }

  togglePlayPause() {
    this.musicPlayerService.setPlayingState(!this.musicPlayerService.isPlaying$);
  }

  goToPlayer() {
    // Navigate to the full player page
  }

  enterPiP() {
    if ('documentPictureInPicture' in window) {
      (window as any).documentPictureInPicture.requestWindow({ width: 320, height: 180 }).then((pipWindow: any) => {
        pipWindow.document.body.appendChild(this.pipContainer.nativeElement);
      });
    }
  }

}
