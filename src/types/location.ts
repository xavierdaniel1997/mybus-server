export enum ILocationStatus {
    ACTIVE = "Active",
    INACTIVE = "Inactive",
}

export interface ILocation {
  _id?: string;
  name: String;
  city: String;
  state: String;
  stationCode: string;
  latitude: string;
  longitude: string;
  locationImage: string;
  status: ILocationStatus;
}
