import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { UploadComponent } from './components/upload/upload.component';
import { queue } from 'rxjs';
import { QueueComponent } from './components/queue/queue.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SearchComponent } from './pages/search/search.component';
import { MusicComponent } from './components/music/music.component';
import { PlaylistsComponent } from './components/playlists/playlists.component';

export const routes: Routes = [
    {path:'',component:HomeComponent},
    {path:'home',component:HomeComponent},
    {path:'home/playlist/:id',component:PlaylistsComponent},
    {path:'login',component:LoginComponent},
    {path:'search',component:SearchComponent},
    {path:'upload',component:UploadComponent},
    {path:'queue',component:QueueComponent},
    {path:'profile',component:ProfileComponent},
    {path:'music',component:MusicComponent},
    {path:'**',component:HomeComponent}
];
