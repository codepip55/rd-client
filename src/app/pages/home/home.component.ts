import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/app/shared/models/user.model';
import { AlertService } from 'src/app/shared/services/alert.service';
import { RdService } from 'src/app/shared/services/rd.service';
import { UserService } from 'src/app/shared/services/user.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(
    public userService: UserService,
    public rdService: RdService
  ) { }
  
  public isLoggedIn: boolean = false;
  public currentUser: User;

  private userSub: Subscription;

  ngOnInit(): void {
    this.userSub = this.userService.currentUser$.subscribe(u => {
      this.isLoggedIn = u !== null;
      if (u !== null) this.currentUser = u;
    });

    this.findCurrentConnectedController()
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  logon() {
    let log = this.rdService.logonPosition()
    console.log(firstValueFrom(log))
    return log
  }

  findCurrentConnectedController() {
    let connection = firstValueFrom(this.rdService.findControllerByCurrentUser())
    console.log(connection)
  }
}
