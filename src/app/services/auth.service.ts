import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { backend } from '../utils/apiUrls';
import { User } from '../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = backend;

  constructor(private http: HttpClient) {}
  
  public userData = new BehaviorSubject<User>({ username: '', role: '' });

  public isLogin$ = new BehaviorSubject<boolean>(false);

  updateUserData(user: User) {
    this.userData.next(user);
  }

  login(username: string, password: string) {
    return this.http.post<{
      username: string; token: string, role: string 
}>(`${this.API_URL}/auth/login`, { username, password });
  }

  isAdmin(): boolean {
    return this.userData.getValue().role ==="admin";
  }

  logout() {
    this.userData.next({ username: '', role: '' });
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
}
