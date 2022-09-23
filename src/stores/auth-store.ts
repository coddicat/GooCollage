import { defineStore } from 'pinia';
import { User } from '@firebase/auth'
import { getFunctions, httpsCallable } from 'firebase/functions';
import { CollectionReference, getFirestore, doc, collection, DocumentSnapshot, onSnapshot, Unsubscribe, getDoc, query, deleteDoc, Timestamp, setDoc } from 'firebase/firestore';
import firebaseApp from '../firebase';
import { AlbumOption, DbUser, MyAlbum } from 'src/types';
import { ADD_ALBUM_ID } from 'src/consts';
import { getAuth, signInAnonymously } from 'firebase/auth';
const functions = getFunctions(firebaseApp);
const getTokenId = httpsCallable(functions, 'getTokenId');
const signin = httpsCallable(functions, 'signin');
const revokeToken = httpsCallable(functions, 'revokeToken');
const deleteAccount = httpsCallable(functions, 'deleteAccount');
const db = getFirestore(firebaseApp);

export const useAuthStore = defineStore('auth', {
  state: () => ({
    fbUser: undefined as User | undefined,
    dbUser: undefined as DbUser | undefined,
    unsub: undefined as Unsubscribe | undefined,
    unsubAlbumList: undefined as Unsubscribe | undefined,
    albumList: [] as AlbumOption[]
  }),
  getters: {
    getFbUser: (state) => state.fbUser,
    getDbUser: (state) => state.dbUser,
    getAlbumList: (state) => state.albumList,
    getSigned: (state) => !!state.fbUser && !state.fbUser.isAnonymous
  },
  actions: {
    async revokeToken(): Promise<void> {
      await revokeToken();
    },
    async deleteAccount(): Promise<void> {
      await deleteAccount();
    },

    async removeAlbumFromList(albumId: string): Promise<void> {
      if (!this.fbUser) {
        return;
      }
      if (!albumId || albumId === ADD_ALBUM_ID) {
        return;
      }

      const uid = this.fbUser.uid;
      const ref = doc(db, `users/${uid}/albums`, albumId);
      await deleteDoc(ref);
    },

    async addAlbumToList(albumId: string, name: string, owner: boolean): Promise<void> {
      if (!this.fbUser) {
        return;
      }

      const uid = this.fbUser.uid;
      const ref = doc(db, `users/${uid}/albums`, albumId);
      const albumOption: MyAlbum = {
        name,
        owner,
        created: Timestamp.now()

      };

      await setDoc(ref, albumOption);
    },

    async loadGooglesAlbumIds(): Promise<string[]> {
      if (!this.getFbUser) {
        return [];
      }
      const albumIds = this.getAlbumList.filter(x => x.owner).map(x => x.id);
      const promises = [] as Promise<string>[];
      albumIds.forEach(id => {
        promises.push(new Promise<string>(async (resolve) => {
          const ref = doc(db, `albums/${id}/secrets`, 'google');
          const res = await getDoc(ref);
          const data = res.data();
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          resolve(data!.albumId);
        }));
      });

      const ids = await Promise.all(promises);
      return ids;
    },

    async setFbUser(fbUser: User | undefined): Promise<void> {
      this.fbUser = fbUser;
      this.dbUser = undefined;
      this.albumList = [];

      if (this.unsub) {
        this.unsub();
        this.unsub = undefined;
      }
      if (this.unsubAlbumList) {
        this.unsubAlbumList();
        this.unsubAlbumList = undefined;
      }

      if (!fbUser) {
        return;
      }

      const userPromise = new Promise<void>(resolve => {
        const colRef = collection(db, 'users') as CollectionReference<DbUser>;
        const ref = doc<DbUser>(colRef, fbUser.uid);
        this.unsub = onSnapshot<DbUser>(ref, (snapshot: DocumentSnapshot<DbUser>) => {
          const data = snapshot.data();
          this.dbUser = data;
          resolve();
        });
      });

      const albumListPromise = new Promise<void>(resolve => {
        const colRef = collection(db, `users/${fbUser.uid}/albums`) as CollectionReference<MyAlbum>;
        const q = query(colRef);
        this.unsubAlbumList = onSnapshot(q, (snapshot) => {
          this.albumList = snapshot.docs.map(x => ({
            id: x.id,
            ...x.data()
          }));
          resolve();
        });
      });

      await Promise.all([userPromise, albumListPromise]);
    },

    async getTokenId(code: string, redirectUri: string): Promise<string> {
      const response = await getTokenId({ code: code, redirectUri: redirectUri });
      return response.data as string;
    },

    async signin(idToken: string): Promise<void> {
      const data = {
        idToken: idToken
      };
      await signin(data);
    },

    async anonimus(): Promise<void> {
      const auth = getAuth();
      const response = await signInAnonymously(auth);
      this.setFbUser(response.user);
    }
  }
});
