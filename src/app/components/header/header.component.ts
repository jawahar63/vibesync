import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{

  private authservies=inject(AuthService);
  private router = inject(Router);

  islogin =false;
  username!:string;

  ngOnInit(): void {
    this.authservies.isLogin$.subscribe((val)=>{
      this.islogin=val;
    });
    this.authservies.userData.subscribe((val)=>{
      this.username=val.username;
    });
  }


  logout(){
    this.authservies.logout();
    this.router.navigate(['login']);
    this.authservies.isLogin$.next(false);
  }

}
