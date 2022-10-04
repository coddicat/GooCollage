import { FirebaseError } from 'firebase/app';
import { collection, CollectionReference, doc, DocumentSnapshot, getFirestore, onSnapshot } from 'firebase/firestore';
import { Album, AlbumAccess } from 'src/types';
import { AlbumState, CachedAlbum, Public } from './album-store-state-type';
import firebaseApp from '../../firebase';
import { useAuthStore } from '../auth-store';
import cacheImages from './album-store-cache';
import callbacks from './album-store-callbacks';
import syncMediaItems from './album-store-syncMediaItems';
import { mediaItemMaxHeight, mediaItemMaxWidth } from 'src/consts';
import dialogExt from 'src/extensions/dialog-ext';
const db = getFirestore(firebaseApp);

function getCacheValid(state: AlbumState) {
  if (!state.cachedAlbum) {
    return false;
  }
  const expiry = state.cachedAlbum.expiry;
  const valid = (expiry.toDate().getTime() - new Date().getTime()) / 1000 > 15;
  return valid;
}

export default {
  async snapshotPublic(state: AlbumState, albumId: string): Promise<void> {
    try {
      console.log('snapshotPublic start');

      const collPublic = collection(db, 'public') as CollectionReference<Public>;
      const refPublic = doc<Public>(collPublic, albumId);

      const result = await new Promise<void>((resolve, reject) => {
        state.unsubPublic = onSnapshot<Public>(refPublic, async (snapshot: DocumentSnapshot<Public>) => {
          try {
            state.public = snapshot.exists() ? snapshot.data() : undefined;
            const authStore = useAuthStore();
            const albumList = await authStore.getAlbumList;
            const album = albumList.find(x => x.id == albumId);
            const owner = album?.owner == true;

            if (owner) {
              await callbacks.onAlbumOwner(state, albumId);
            } else {
              await callbacks.onForeign(state);
            }

            resolve();
          }
          catch (error) {
            reject(error);
          }
        }, (error: FirebaseError) => {
          console.error('snapshotPublic:', error);
          reject(error);
        })
      });
      return result;
    } catch (error) {
      state.albumResult = {
        success: false,
        passwordRequest: false
      }
      throw (error);
    } finally {
      console.log('snapshotPublic end');
    }
  },

  snapshotAccess(state: AlbumState, albumId: string, uid: string): Promise<void> {
    const collAccesses = collection(db, `public/${albumId}/accesses`) as CollectionReference<AlbumAccess>;
    const refAccess = doc<AlbumAccess>(collAccesses, uid);

    return new Promise<void>((resolve, reject) => {
      state.unsubAccess = onSnapshot<AlbumAccess>(refAccess, async (snapshot: DocumentSnapshot<AlbumAccess>) => {
        try {
          state.access = snapshot.exists() ? snapshot.data() : undefined;
          await callbacks.onForeign(state);
          resolve();
        } catch (error) {
          reject(error);
        }
      }, (error: FirebaseError) => {
        console.error('snapshotAccess:', error);
        reject(error);
      });
    });
  },

  snapshotPassword(state: AlbumState, albumId: string): Promise<void> {
    const collPassw = collection(db, `albums/${albumId}/secrets`) as CollectionReference<{ value: string }>;
    const refPassw = doc<{ value: string }>(collPassw, 'password');

    const result = new Promise<void>((resolve, reject) => {
      state.unsubPassword = onSnapshot<{ value: string }>(refPassw, (snapshot: DocumentSnapshot<{ value: string }>) => {
        state.password = snapshot.exists() ? snapshot.data().value : undefined;
        resolve();
      }, (error: FirebaseError) => {
        console.error('snapshotPassword:', error);
        reject(error)
      });
    });

    return result;
  },

  snapshotAlbum(state: AlbumState, albumId: string): Promise<void> {
    const collAlbum = collection(db, 'albums') as CollectionReference<Album>;
    const refAlbum = doc<Album>(collAlbum, albumId);
    const result = new Promise<void>((resolve, reject) => {
      state.unsubAlbum = onSnapshot<Album>(refAlbum, async (snapshot: DocumentSnapshot<Album>) => {
        if (!snapshot.exists()) {
          resolve();
          return;
        }
        const data = snapshot.data();
        state.properties = {
          columns: data?.columns ?? 0,
          rows: data?.rows ?? 0,
          transition: data?.transition ?? 'fade',
          randomGridOrder: data?.randomGridOrder ?? true,
          orientation: data?.orientation ?? false,
          fit: data?.fit ?? 'cover',
          interval: data?.interval ?? 2
        };
        state.name = data?.name ?? '';
        state.albumUid = data?.uid;
        resolve();
      }, (error: FirebaseError) => {
        console.error('snapshotAlbum:', error);
        reject(error);
      });
    });
    return result;
  },

  async snapshotCache(state: AlbumState, albumId: string): Promise<void> {
    const collCache = collection(db, 'cache') as CollectionReference<CachedAlbum>;
    const refCache = doc<CachedAlbum>(collCache, albumId);
    await new Promise<void>((resolve, reject) => {
      state.unsubCache = onSnapshot<CachedAlbum>(refCache, async (snapshot: DocumentSnapshot<CachedAlbum>) => {
        try {
          console.log('snapshotCache start');
          if (!snapshot.exists()) {
            await syncMediaItems(albumId);
            resolve();
            return;
          }
          const data = snapshot.data();
          state.cachedAlbum = data;
          const valid = getCacheValid(state);
          if (valid) {
            state.items = data?.items?.map(item => ({
              id: item.id,
              baseUrl: `${item.baseUrl}=w${mediaItemMaxWidth}-h${mediaItemMaxHeight}`,
            })) ?? [];
            const cachResult = await cacheImages(state);
            if (!cachResult) {
              dialogExt.obtainMediaItemsFailed();
            }
          } else {
            await syncMediaItems(albumId);
          }
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          console.log('snapshotCache end');
        }
      }, (error: FirebaseError) => {
        console.error('snapshotCache:', error);
        reject(error);
      });
    });
    return;
  },
}
