import { Timestamp } from 'firebase/firestore';

export type Transition =
  'RANDOM' |
  'fade' |
  'slide-right' |
  'slide-left' |
  'slide-up' |
  'slide-down' |
  'jump-right' |
  'jump-left' |
  'jump-up' |
  'jump-down'

export const Transitions: Transition[] = [
  'fade',
  'slide-right',
  'slide-left',
  'slide-up',
  'slide-down',
  'jump-right',
  'jump-left',
  'jump-up',
  'jump-down'
]

export type AlbumItem = {
  id: string,
  baseUrl: string,
};

export type Album = {
  rows: number,
  columns: number,
  randomGridOrder: boolean;
  transition: Transition;
  interval: number;
  name: string;
  uid: string;
  orientation: boolean;
  fit: Fit;
  created: Timestamp;
}

export type GoogleSecret = {
  albumId: string;
}

export type AlbumOption = {
  id: string,
  name: string,
  owner: boolean,
  created: Timestamp,
}

export type AlbumAccess = {
  expiry: Timestamp,
  version: string
}

export type AlbumResult = {
  success: boolean,
  passwordRequest: boolean
}

export type MyAlbum = {
  name: string,
  owner: boolean,
  created: Timestamp,
}

export type DbUser = {
  sub: string;
  revoked: boolean;
}
export type AppSettings = {
  client_id: string;
  client_secret: string;
}
export type GoogleAlbumInfo = {
  coverPhotoBaseUrl: string;
  id: string;
  title: string;
  mediaItemsCount: string;
}

export type Fit = 'cover' | 'fill' | 'contain';

export type AlbumProperties = {
  columns: number;
  rows: number;
  randomGridOrder: boolean;
  transition: Transition;
  orientation: boolean;
  fit: Fit;
  interval: number;
}
