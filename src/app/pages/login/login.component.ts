import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  private formBuilder=inject(FormBuilder);
  private authservies=inject(AuthService);
  private router=inject(Router);

  pass:boolean=false;
  loginForm !:FormGroup;
  ngOnInit(){
    this.authservies.isLogin$.subscribe((val)=>{
      if(val)this.router.navigate(['home']);
    })
    this.loginForm=this.formBuilder.group({
    username:new FormControl('',Validators.required),
    password:new FormControl('',Validators.required)
  });
  } 

  login(){
    this.authservies.login(this.loginForm.value.username,this.loginForm.value.password).subscribe({
      next:(res)=>{
        console.log(res);
        this.authservies.updateUserData({username:res.username,role:res.role});
        localStorage.setItem('token',res.token);
        this.router.navigate(['home']);
        this.authservies.isLogin$.next(true);
      },
      error:(err)=> {
        console.log(err);
      },
    })
  }
  see(){
    this.pass=!this.pass
  }
}
