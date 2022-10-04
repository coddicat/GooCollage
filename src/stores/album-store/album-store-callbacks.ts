import { AlbumState } from './album-store-state-type';
import snapshots from './album-store-snapshots';
import { useAuthStore } from '../auth-store';
import { ADD_ALBUM_ID } from 'src/consts';

function hasAccess(state: AlbumState) {
  return !!state.access && state.access.version == state.public?.version;
}
function clearAlbumData(state: AlbumState) {
  state.properties = undefined;
  state.items = [];
  state.cachedAlbum = undefined;
}

export default {
  onAccessDenied(state: AlbumState, passwordRequired: boolean) {
    state.albumResult = {
      success: false,
      passwordRequest: passwordRequired
    }
    if (state.unsubAlbum) {
      state.unsubAlbum();
      state.unsubAlbum = undefined;
    }
    if (state.unsubCache) {
      state.unsubCache();
      state.unsubCache = undefined;
    }
    clearAlbumData(state);
  },

  async onAlbumOwner(state: AlbumState, albumId: string): Promise<void> {
    console.log('onAlbumOwner start');

    const promises = [];
    if (!state.unsubPassword) {
      promises.push(snapshots.snapshotPassword(state, albumId));
    }
    if (!state.unsubAlbum) {
      promises.push(snapshots.snapshotAlbum(state, albumId));
    }
    if (!state.unsubCache) {
      promises.push(snapshots.snapshotCache(state, albumId));
    }
    await Promise.all(promises);

    state.albumResult = {
      success: true,
      passwordRequest: false
    };

    console.log('onAlbumOwner end');
  },

  async onPublicNoPassword(state: AlbumState, albumId: string): Promise<void> {
    const promises = [];
    if (!state.unsubAlbum) {
      promises.push(snapshots.snapshotAlbum(state, albumId));
    }
    if (!state.unsubCache) {
      promises.push(snapshots.snapshotCache(state, albumId));
    }
    await Promise.all(promises);
    state.albumResult = {
      success: true,
      passwordRequest: false
    };
  },

  async onPublicRequiredPassword(state: AlbumState, albumId: string): Promise<void> {
    const authStore = useAuthStore();
    let uid = authStore.getFbUser?.uid;
    if (!uid) {
      await authStore.anonimus();
      uid = authStore.getFbUser?.uid;
      if (!uid) {
        this.onAccessDenied(state, false);
        return;
      }
    }

    if (!state.unsubAccess) {
      await snapshots.snapshotAccess(state, albumId, uid);
    }

    if (!hasAccess(state)) {
      this.onAccessDenied(state, true);
      return;
    }

    if (hasAccess(state)) {
      const promises = [];
      if (!state.unsubAlbum) {
        promises.push(snapshots.snapshotAlbum(state, albumId));
      }
      if (!state.unsubCache) {
        promises.push(snapshots.snapshotCache(state, albumId));
      }

      await Promise.all(promises);

      state.albumResult = {
        success: true,
        passwordRequest: false
      }
    }
  },

  async onForeign(state: AlbumState): Promise<void> {
    const albumId = state.albumId;
    if (!albumId || albumId == ADD_ALBUM_ID) {
      state.albumResult = undefined;
      return;
    }

    if (!state.public?.status) {
      this.onAccessDenied(state, false);
      return;
    }
    console.log('onForeign start');

    if (!!state.public?.password) {
      await this.onPublicRequiredPassword(state, albumId);
    } else {
      await this.onPublicNoPassword(state, albumId);
    }

    console.log('onForeign end');
  },
}
