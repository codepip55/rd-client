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
  public loading: boolean = true;
  public currentUser: User;

  public isConnected: boolean = false;
  public callsign: string | undefined | null;

  private userSub: Subscription;
  private loadingSub: Subscription;

  ngOnInit(): void {
    this.userSub = this.userService.currentUser$.subscribe(u => {
      this.isLoggedIn = u !== null;
      this.isConnected = u?.currentPosition !== null;
      if (u !== null) this.currentUser = u;
      if (u?.currentPosition !== null) this.callsign = u?.currentPosition
    });

    this.loadingSub = this.userService.loading$.subscribe(l => {
      this.loading = l;
    })

    this.findCurrentConnectedController()
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.loadingSub.unsubscribe();
  }

  async logon() {
    let log = await firstValueFrom(this.rdService.logonPosition())
    this.isConnected = true;
    // @ts-expect-error
    this.callsign = log.currentPosition;
    return log
  }

  async findCurrentConnectedController() {
    let connection = await firstValueFrom(this.rdService.findControllerByCurrentUser())
    console.log(connection)
  }

  async logoff() {
    let log = await firstValueFrom(this.rdService.logoffPosition())
    this.isConnected = false;
    this.callsign = null;
    return log
  }

}
