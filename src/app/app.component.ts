import { Component, HostListener, inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MusicPlayerComponent } from './components/music-player/music-player.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms'
import { UploadComponent } from "./components/upload/upload.component";
import { LoginComponent } from './pages/login/login.component';
import { AuthService } from './services/auth.service';
import { MusicService } from './services/music.service';
import { Song } from './model/song.model';
import { JwtdecodeService } from './services/jwtdecode.service';
import { MainComponent } from "./main/main/main.component";

@Component({
  selector: 'app-root',
  imports: [MainComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent{
  title = 'vibeSync';

  
}
