import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Song } from '../../model/song.model';
import { JwtdecodeService } from '../../services/jwtdecode.service';
import { MusicService } from '../../services/music.service';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MusicPlayerComponent } from '../../components/music-player/music-player.component';
import { HeaderComponent } from '../../components/header/header.component';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, CommonModule,FormsModule,MusicPlayerComponent,HeaderComponent,BottomNavComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {

  private authservies=inject(AuthService);
  private router = inject(Router);
  private musicservies=inject(MusicService);
  private jwtservies=inject(JwtdecodeService);
  private playService=inject(PlayerService);

  private token = localStorage.getItem('token')||"";
  islogin =false;
  currentSong!:Song;
  isAdmin = false;
  username!:string;
  isPlaying=false;
  

  constructor(private http: HttpClient) {}

  ngOnInit() {
    if(this.token){
      const data = this.jwtservies.decodetoken(this.token);
      this.authservies.updateUserData({username:data.username,role:data.role});
      this.authservies.isLogin$.next(true);
      this.islogin=true;
      this.username=data.username; 
      
    }else{
      this.router.navigate(['login']);
    }
    this.musicservies.currentSong.subscribe((song:Song)=>{
      this.currentSong=song;
    })
    this.isAdmin = this.authservies.isAdmin();
    this.authservies.isLogin$.subscribe((val)=>{
      this.islogin=val;
    });
    this.playService.isMiniPlayerOpen$.subscribe((val)=>{
      this.isPlaying=val;
    })
    
  }

  upload(){
    this.router.navigate(['upload']);
  }
  
}
