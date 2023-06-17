import { Component, OnInit } from '@angular/core';
import { UserService } from './shared/services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'rd-client';

  constructor(
    public userService: UserService
  ) { }

  ngOnInit(): void {
    // Run authentication
    if (window.location.pathname === '/auth_callback') {
      this.userService.handleCallback();
    } else {
      this.userService.silentAuth(true);
    }
  }
}
