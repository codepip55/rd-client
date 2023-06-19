import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/app/shared/models/user.model';
import { AlertService } from 'src/app/shared/services/alert.service';
import { RdService } from 'src/app/shared/services/rd.service';
import { UserService } from 'src/app/shared/services/user.service';
import { firstValueFrom } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { Aircraft } from 'src/app/shared/models/aircraft.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(
    public userService: UserService,
    public rdService: RdService,
    private fb: FormBuilder,
    private alertService: AlertService
  ) { }
  
  public isLoggedIn: boolean = false;
  public loading: boolean = true;
  public currentUser: User;

  public isConnected: boolean = false;
  public callsign: string | undefined | null;

  private userSub: Subscription;
  private loadingSub: Subscription;

  public rdList: Record<string, any>[];
  private rdCount: number;

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

    setInterval(() => {
      if (this.isConnected && this.isLoggedIn) this.getControllerList()
    }, 2000)

  }

  async getControllerList() {
    let list = await firstValueFrom(this.rdService.getControllerList())

    if (this.rdCount < list.count) this.playNotification()

    this.rdList = list.data!.sort((a, b) => {
      return new Date(a['addedTimestamp']).getTime() - new Date(b['addedTimestamp']).getTime()
    })

    this.rdCount = list.count
    console.log(list)
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.loadingSub.unsubscribe();
  }

  async logon() {
    let log = await firstValueFrom(this.rdService.logonPosition())
    console.log(log)
    // @ts-ignore
    if (log.user !== null) {
      this.isConnected = true
      // @ts-expect-error
      this.callsign = log.currentPosition
    };
    return log
  }

  async logoff() {
    let log = await firstValueFrom(this.rdService.logoffPosition())
    this.isConnected = false;
    this.callsign = null;
    return log
  }

  public rdForm = this.fb.group({
    input: ['RD ', Validators.required]
  })

  async sendAircraft() {
    const input = this.rdForm.value.input;

    const regex = /RD \d{4}/;
    const isTransponderCode = regex.test(input!);

    if (isTransponderCode) {
      if (this.callsign?.endsWith("TWR")) {
        const res = await firstValueFrom(this.rdService.sendAircraftByCode(input!.slice(-4)));
      }
      if (this.callsign?.endsWith("DEP") || this.callsign?.endsWith("APP")) {
        const res = await firstValueFrom(this.rdService.acceptAircraftByCode(input!.slice(-4)))
      }
    }

    if (!isTransponderCode) {
      if (this.callsign?.endsWith("TWR")) {
        const res = await firstValueFrom(this.rdService.sendAircraftByCallsign(input!.slice(3)))
      }
      if (this.callsign?.endsWith("DEP") || this.callsign?.endsWith("APP")) {
        const res = await firstValueFrom(this.rdService.acceptAircraftByCallsign(input!.slice(3)))
      }
    }

    this.rdForm.patchValue({
      input: "RD "
    })
  }

  playNotification() {
    const audio = new Audio()
    audio.src = '../../assets/notification.wav'
    audio.load()
    audio.play()
  }

}
