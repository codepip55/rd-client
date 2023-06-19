import { User } from "./user.model";

export class Aircraft {
  addedTimestamp: Date;
  localController: User;
  departureController: User;
  accepted: boolean;
  callsign: string;
  transponder: string;
}