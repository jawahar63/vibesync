import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { Song } from '../model/song.model';
import { backend } from '../utils/apiUrls';
import { Queue } from '../model/queue.model';
declare var YT: any;

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private API_URL = backend;
  private youTubePlayer?: any;

  constructor(private http: HttpClient) {
    
  }
  
  public currentSong =  new BehaviorSubject<Song>({_id:'',title:'',artist:'',genre:'',album:'',imageUrl:'',audioUrl:'',liked:false});
  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  isPlaying$ = this.isPlayingSubject.asObservable();
  private cachedSongs = new BehaviorSubject<Song[]>([]);
  private audioCache = new Map<string, Blob>(); 
  token:string = localStorage.getItem('token')||'';
  header=new HttpHeaders({
    'authorization': `Bearer ${this.token}`
  });

  public songs = new BehaviorSubject<Queue>(new Queue());





  addSongToQueue(song: Song | Song[]) {
    const updatedQueue = this.songs.getValue();
    updatedQueue.insert(song);
    this.songs.next(updatedQueue);
    if(this.currentSong.getValue()._id==''&& updatedQueue.current){
      this.currentSong.next(updatedQueue.current.song);
    }
    this.preloadNextSong(); 
  }

  addsongToQueueCurrent(song: Song) {
    const updatedQueue = this.songs.getValue();
    updatedQueue.insertCurrent(song);
    this.songs.next(updatedQueue);
    this.preloadNextSong(); 
  }

  addSongToQueueNext(song: Song) {
    const updatedQueue = this.songs.getValue();
    updatedQueue.insertNextCurrent(song);
    this.songs.next(updatedQueue);
    this.preloadNextSong(); 

  }

  addSongToQueueArray(song: Song[]) {
    const updatedQueue = this.songs.getValue();
    updatedQueue.insert(song);
    this.songs.next(updatedQueue);
  }


  updateCurrentSong(song:Song){
    this.currentSong.next(song);
    this.preloadNextSong(); 
  }

  setPlayingState(isPlaying: boolean) {
    this.isPlayingSubject.next(isPlaying);
  }

  getSongs(query?: string) {
    const searchUrl = query ? `${this.API_URL}/songs/yt-songs?query=${query}&limit=20` : `${this.API_URL}/songs/yt-songs`;
    return this.http.get(searchUrl,{
      headers:this.header
    });
  }
  // getSongsCloud(query: string){
  //   return this.http.get<Song[]>(`${this.API_URL}/songs?search=${query}`)
  // }

   getSongsCloud(query: string): Observable<Song[]> {
    if (this.cachedSongs.value.length && query.trim() === '') {
      return this.cachedSongs.asObservable();
    }

    return this.http.get<Song[]>(`${this.API_URL}/songs?query=${query}`,{
      headers:this.header
    }).pipe(
      tap((songs) => {
        if (query.trim() === '') {
          this.cachedSongs.next(songs); 
        }
      }),
      catchError(() => {
        return of(this.cachedSongs.value);
      })
    );
  }

  getSongsSpot(){
    return this.http.get(`${this.API_URL}/songs/spot/search`,{
      headers:this.header
    });
  }
  getSongsLast(query?: string){
    const searchUrl = query ? `${this.API_URL}/songs/lastfm-songs?query=${query}&limit=20` : `${this.API_URL}/songs/lastfm-songs`;
    return this.http.get(searchUrl,{
      headers:this.header
    });
  }

  getPlaylists(playlistName:string) {
    return this.http.get(`${this.API_URL}/playlists/${playlistName}`,{
      headers:this.header
    });
  }

  uploadSongs(formData: FormData) {
    return this.http.post(`${this.API_URL}/upload`, formData,{
      headers:this.header
    });
  }

  addToDB(song:Song){
    return this.http.post(`${this.API_URL}/songs/addToDB`,song,{
      headers:this.header
    });
  }

  like(id:string){
    return this.http.post(`${this.API_URL}/songs/like/${id}`,{},{
      headers:this.header
    });
  }


  //queue
  skipToNext() {
    const queue = this.songs.getValue();
    if (queue.current && queue.current.next) {
      this.updateCurrentSong(queue.current.next.song);
      queue.skipNext();
      this.songs.next(queue);
      this.preloadNextSong(); 
    }
  }

  skipToPrevious() {
    const queue = this.songs.getValue();
    if (queue.current && queue.current.prev) {
      this.updateCurrentSong(queue.current.prev.song);
      queue.skipPrev();
      this.songs.next(queue);
    }
  }

  shuffleQueue(){
    const queue = this.songs.getValue();
    queue.shuffleNext();
    this.songs.next(queue); 
  }
  shuffleQueueComplete(){
    const queue = this.songs.getValue();
    queue.shuffle();
    this.songs.next(queue); 
    
    if(this.currentSong.getValue()._id==''&& queue.head){
      this.currentSong.next(queue.head.song);
    }
    this.preloadNextSong();
  }
  
  moveTop(song:Song) { 
    const queue = this.songs.getValue();
    queue.moveTop(song);
    this.songs.next(queue);
    this.preloadNextSong(); 
  }
  moveUp(song:Song) { 
    const queue = this.songs.getValue();
    queue.moveUp(song);
    this.songs.next(queue);
    this.preloadNextSong(); 
  }
  moveDown(song:Song) { 
    const queue = this.songs.getValue();
    queue.moveDown(song);
    this.songs.next(queue);
    this.preloadNextSong(); 
  }
  moveBottom(song:Song) { 
    const queue = this.songs.getValue();
    queue.moveBottom(song);
    this.songs.next(queue);
    this.preloadNextSong(); 
  }
  deleteSong(song:Song) {
    const queue = this.songs.getValue();
    queue.deleteSong(song);
    this.songs.next(queue);
  }

  //song cache
  async getAudioBlob(song: Song): Promise<string | Blob> {
    if (song.isYt) {
      return song.audioUrl;
    }

    if (this.audioCache.has(song.audioUrl)) {
      return this.audioCache.get(song.audioUrl)!;
    }

    const streamUrl = `${this.API_URL}/songs/stream/cloud?url=${encodeURIComponent(song.audioUrl)}`;
    const audioBlob = await this.http.get(streamUrl, { responseType: 'blob', headers: this.header }).toPromise();
    this.audioCache.set(song.audioUrl, audioBlob!);
    return audioBlob!;
  }

  private async preloadNextSong() {
    const queue = this.songs.getValue();
    const nextSong = queue.current?.next?.song;

    if (nextSong && !this.audioCache.has(nextSong.audioUrl)) {
      // Cache the next song for smoother playback
      await this.getAudioBlob(nextSong);
    }
  }

}
