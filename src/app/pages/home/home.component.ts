import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/app/shared/models/user.model';
import { AlertService } from 'src/app/shared/services/alert.service';
import { RdService } from 'src/app/shared/services/rd.service';
import { UserService } from 'src/app/shared/services/user.service';
import { firstValueFrom } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';

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

    this.getControllerList()
  }

  async getControllerList() {
    let list = await firstValueFrom(this.rdService.getControllerList())
    // @ts-ignore
    this.rdList = list.data.sort((a, b) => {
      return new Date(a['addedTimestamp']).getTime() - new Date(b['addedTimestamp']).getTime()
    })
    console.log(list)
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
      const res = await firstValueFrom(this.rdService.sendAircraftByCode(input!.slice(-4)));
      this.alertService.add({ type: 'success', message: 'Aircraft added' })
    }

    if (!isTransponderCode) {
      const res = await firstValueFrom(this.rdService.sendAircraftByCallsign(input!.slice(3)))
      this.alertService.add({ type: 'success', message: 'Aircraft added' })
    }

    this.rdForm.patchValue({
      input: "RD "
    })
  }

}
