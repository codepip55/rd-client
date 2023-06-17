import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {

  constructor(
    public userService: UserService
  ) { }

  public isLoggedIn: boolean = false;
  public currentUser: User;

  private userSub: Subscription;

  ngOnInit(): void {
    this.userSub = this.userService.currentUser$.subscribe(u => {
      this.isLoggedIn = u !== null;
      if (u !== null) this.currentUser = u;
    });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

}