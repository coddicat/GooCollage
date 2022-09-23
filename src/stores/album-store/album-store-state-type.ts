import { Timestamp, Unsubscribe } from 'firebase/firestore'
import { AlbumAccess, AlbumItem, AlbumProperties, AlbumResult } from 'src/types'

type CachedItem = {
  id: string,
  baseUrl: string
}
export type CachedAlbum = {
  items: CachedItem[],
  expiry: Timestamp
}
export type Public = {
  //uid: string,
  name: string,
  password: boolean,
  status: boolean,
  version: string
}


export type AlbumState = {
  albumId: string | undefined,
  items: AlbumItem[],
  unsubAlbum: Unsubscribe | undefined,
  unsubCache: Unsubscribe | undefined,
  unsubPublic: Unsubscribe | undefined,
  unsubAccess: Unsubscribe | undefined,
  unsubPassword: Unsubscribe | undefined,
  properties: AlbumProperties | undefined,
  name: string,
  savingIndicator: boolean,
  albumUid: string | undefined,
  cache: { [key: string]: HTMLCanvasElement },
  cachedAlbum: undefined | CachedAlbum,
  public: undefined | Public,
  access: AlbumAccess | undefined,
  password: string | undefined,
  albumResult: AlbumResult | undefined
}
