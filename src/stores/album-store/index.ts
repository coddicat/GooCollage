import { defineStore } from 'pinia';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  CollectionReference, getFirestore,
  doc, collection, updateDoc, writeBatch, Timestamp, setDoc, getDoc,
} from 'firebase/firestore';
import { AlbumItem, Album, MyAlbum, GoogleSecret } from 'src/types';
import firebaseApp from '../../firebase';
import { useAuthStore } from '../auth-store';
import { ADD_ALBUM_ID } from 'src/consts';
import { AlbumState, Public } from './album-store-state-type';
import snapshots from './album-store-snapshots';
import syncMediaItems from './album-store-syncMediaItems';

const db = getFirestore(firebaseApp);
const functions = getFunctions(firebaseApp);
const albumAccess = httpsCallable(functions, 'albumAccess');
const deleteAlbum = httpsCallable(functions, 'deleteAlbum');

type propertyName = 'columns' | 'rows' | 'randomGridOrder' | 'transition' | 'orientation' | 'public' | 'password' | 'fit' | 'interval';

export const useAlbumStore = defineStore('grid', {
  state: (): AlbumState => ({
    albumId: undefined,
    items: [],
    unsubAlbum: undefined,
    unsubCache: undefined,
    unsubPublic: undefined,
    unsubAccess: undefined,
    unsubPassword: undefined,
    properties: undefined,
    name: '',
    savingIndicator: false,
    albumUid: undefined,
    cache: {},
    cachedAlbum: undefined,
    public: undefined,
    access: undefined,
    password: undefined,
    albumResult: undefined
  }),
  getters: {
    getPassword: (state) => state.password,
    getPublic: (state) => state.public,
    getSavingIndicator: (state) => state.savingIndicator,
    getProperties: (state) => state.properties,
    getColumns: (state) => state.properties?.columns,
    getRows: (state) => state.properties?.rows,
    getItems: (state) => state.items,
    getRandomGridOrder: (state) => state.properties?.randomGridOrder,
    getTransition: (state) => state.properties?.transition,
    getAlbumName: (state) => state.name,
    getOrientation: (state) => state.properties?.orientation,
    getAlbumId: (state) => state.albumId,
    getFit: (state) => state.properties?.fit,
    getInterval: (state) => state.properties?.interval,
    getAlbumUid: (state) => state.albumUid,
  },
  actions: {
    async renameAlbum(name: string) {
      if (!this.albumId || this.albumId === ADD_ALBUM_ID) {
        return;
      }
      const authStore = useAuthStore();
      if (!authStore.fbUser) {
        return;
      }

      try {
        this.savingIndicator = true;
        const batch = writeBatch(db);
        const uid = authStore.fbUser.uid;
        const albumId = this.albumId;
        const ref = doc(db, `users/${uid}/albums`, albumId);
        const publicRef = doc(db, 'public', albumId);
        const publicDoc = await getDoc(publicRef);

        if (publicDoc.exists()) {
          batch.update(publicRef, {
            name
          });
        }

        batch.update(ref, {
          name
        });

        if (authStore.fbUser.uid === this.albumUid) {
          const albumRef = doc(db, 'albums', this.albumId);
          batch.update(albumRef, {
            name: name
          })
        }
        this.name = name;
        await batch.commit();
      }
      finally {
        this.savingIndicator = false;
      }
    },

    async syncMediaItems(): Promise<void> {
      return syncMediaItems(this.albumId);
    },

    async addAlbum(googleAlbumId: string, albumName: string): Promise<string | undefined> {
      const authStore = useAuthStore();

      if (!authStore.fbUser) {
        return;
      }
      const album: Album = {
        uid: authStore.fbUser.uid,
        columns: 3,
        rows: 2,
        randomGridOrder: true,
        transition: 'RANDOM',
        orientation: true,
        name: albumName,
        interval: 2,
        fit: 'cover',
        created: Timestamp.now()
      };
      const googleSecret: GoogleSecret = {
        albumId: googleAlbumId
      }

      try {
        this.savingIndicator = true;
        const batch = writeBatch(db);
        const albumRef = doc(collection(db, 'albums'));
        batch.set(albumRef, album);
        const albumId = albumRef.id;

        const googleSecretRef = doc(collection(db, `albums/${albumId}/secrets`), 'google');
        batch.set(googleSecretRef, googleSecret);

        const uid = authStore.fbUser.uid;
        const ref = doc(db, `users/${uid}/albums`, albumId);
        const albumOption: MyAlbum = {
          name: albumName,
          owner: true,
          created: Timestamp.now(),
        };

        batch.set(ref, albumOption);
        await batch.commit();

        return albumId;
      } finally {
        this.savingIndicator = false;
      }
    },

    async deleteAlbum(): Promise<void> {
      if (!this.albumId || this.albumId === ADD_ALBUM_ID) {
        return;
      }
      const authStore = useAuthStore();
      if (!authStore.fbUser) {
        return;
      }

      const albumId = this.albumId;
      this.destroy();
      this.clearData();

      try {
        this.savingIndicator = true;
        await deleteAlbum({ albumId });
      }
      catch (error) {
        console.error(error);
      }
      finally {
        this.savingIndicator = false;
      }
    },

    async setPassword(value: string): Promise<void> {
      try {
        this.savingIndicator = true;

        if (!this.albumId) {
          console.warn('albumId is undefined');
          return;
        }
        const authStore = useAuthStore();
        if (!authStore.fbUser) {
          return;
        }
        if (authStore.fbUser.uid != this.albumUid) {
          return;
        }

        if (!!this.public && this.public.version == value) {
          return;
        }

        const batch = writeBatch(db);
        const collPassw = collection(db, `albums/${this.albumId}/secrets`) as CollectionReference<{ value: string }>;
        const refPassw = doc<{ value: string }>(collPassw, 'password');
        batch.set(refPassw, {
          value
        });
        const collPublic = collection(db, 'public') as CollectionReference<Public>;
        const refPublic = doc<Public>(collPublic, this.albumId);
        const version = doc(collection(db, 'public')).id;
        batch.update(refPublic, {
          version,
          password: !!value
        });
        await batch.commit();
      } catch (error) {
        console.error(error);
      } finally {
        this.savingIndicator = false;
      }
    },

    async setAlbumId(albumId: string | undefined, refresh?: boolean): Promise<void> {
      if (this.albumId === albumId && !refresh) return;

      this.destroy();
      this.clearData();

      this.albumId = albumId;
      if (!albumId || albumId == ADD_ALBUM_ID) return;

      console.log('setAlbumId start');

      await snapshots.snapshotPublic(this.$state, albumId);

      console.log('setAlbumId end');
    },

    async setProperty<T>(propName: propertyName, propValue: T): Promise<void> {
      this.savingIndicator = true;
      try {
        if (!this.albumId) {
          console.warn('albumId is undefined');
          return;
        }
        const ref = doc(db, 'albums', this.albumId);
        await updateDoc(ref, { [propName]: propValue });
      } finally {
        this.savingIndicator = false;
      }
    },

    async setPublic(value: boolean): Promise<void> {
      this.savingIndicator = true;
      try {
        if (!this.albumId) {
          console.warn('albumId is undefined');
          return;
        }
        const authStore = useAuthStore();
        if (!authStore.fbUser) {
          return;
        }
        const uid = authStore.fbUser.uid;
        if (uid != this.albumUid) {
          return;
        }

        const ref = doc(db, 'public', this.albumId);
        await setDoc(ref, {
          name: this.getAlbumName,
          status: value,
          uid
        }, { merge: true });

      } finally {
        this.savingIndicator = false;
      }
    },

    async setItemsAsync(items: AlbumItem[]): Promise<void> {
      if (this.albumId === undefined) {
        console.warn('albumId is undefined');
        return;
      }
      const ref = doc(db, 'albums', this.albumId);
      await updateDoc(ref, { items: items });
    },

    async submitAccess(password: string): Promise<boolean> {
      if (!this.albumId || this.albumId === ADD_ALBUM_ID) {
        return false;
      }
      const result = await albumAccess({ albumId: this.albumId, password, version: this.public?.version });
      return result.data as boolean;
    },

    clearData() {
      this.albumId = undefined,
        this.name = '';
      this.albumUid = undefined;
      this.public = undefined;
      this.access = undefined;
      this.password = undefined;
      this.properties = undefined;
      this.items = [];
      this.cachedAlbum = undefined;
      this.albumResult = undefined;
    },

    destroy(): void {
      try {
        if (!!this.unsubAlbum) {
          this.unsubAlbum();
          this.unsubAlbum = undefined;
        }
        if (!!this.unsubCache) {
          this.unsubCache();
          this.unsubCache = undefined;
        }
        if (!!this.unsubPublic) {
          this.unsubPublic();
          this.unsubPublic = undefined;
        }
        if (!!this.unsubAccess) {
          this.unsubAccess();
          this.unsubAccess = undefined;
        }
        if (!!this.unsubPassword) {
          this.unsubPassword();
          this.unsubPassword = undefined;
        }
      } catch {
        //ignore
      }
    }
  },
});
