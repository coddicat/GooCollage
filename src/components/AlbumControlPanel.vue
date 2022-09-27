<template>
  <q-item v-if="!owner && signed && !disabled" class="justify-center">
    <q-btn-group flat v-if="inList">
      <q-btn
        @click="rename"
        flat
        color="primary"
        icon="drive_file_rename_outline"
        label="Rename"
      />
      <q-btn
        flat
        color="negative"
        icon="delete"
        label="Remove"
        @click="removeAlbumFromList"
      />
    </q-btn-group>
    <q-btn
      v-else
      flat
      color="red"
      icon="library_add"
      label="Add to my list"
      @click="addAlbumToList"
    />
  </q-item>
  <q-item v-else-if="owner" class="justify-center">
    <q-btn-group dense flat>
      <q-btn
        @click="syncMediaItems"
        dense
        flat
        color="secondary"
        icon="cloud_sync"
        label="Sync"
      />
      <q-btn
        @click="rename"
        dense
        flat
        color="primary"
        icon="drive_file_rename_outline"
        label="Rename"
      />
      <q-btn
        @click="deleteAlbum"
        dense
        flat
        color="negative"
        icon="delete"
        label="Delete"
      />
    </q-btn-group>
  </q-item>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useAlbumStore } from 'stores/album-store';
import { ADD_ALBUM_ID } from 'src/consts';
import { useAuthStore } from 'src/stores/auth-store';
import { Loading, QSpinnerGrid } from 'quasar';
import { useRouter } from 'vue-router';
import notifyExt from 'src/extensions/notify-ext';
import dialogExt from 'src/extensions/dialog-ext';

export default defineComponent({
  name: 'AlbumControlPanel',
  props: {
    signed: Boolean,
    owner: Boolean,
  },
  setup() {
    const router = useRouter();
    const store = useAlbumStore();
    const authStore = useAuthStore();
    const currentAlbumId = computed((): string | undefined => store.getAlbumId);
    const currentAlbumName = computed((): string => {
      const album = authStore.getAlbumList.find(
        (x) => x.id === currentAlbumId.value
      );
      if (album) {
        return album.name;
      }
      return store.getAlbumName;
    });

    return {
      async deleteAlbum() {
        if (!store.getAlbumId) {
          return;
        }

        const result = await dialogExt.deleteAlbum(currentAlbumName.value);
        if (!result) {
          return;
        }

        try {
          Loading.show({
            message: 'Album deletion.',
            spinner: QSpinnerGrid,
            spinnerColor: 'negative',
          });
          await store.deleteAlbum();
          await router.replace({ name: 'Home' });
          notifyExt.albumDeleted();
        } finally {
          Loading.hide();
        }
      },
      async rename() {
        const result = await dialogExt.renameAlbum(currentAlbumName.value);
        if (!result.ok) {
          return;
        }

        await store.renameAlbum(result.data);
        notifyExt.albumRenamed();
      },
      async addAlbumToList() {
        if (!store.getAlbumId) {
          return;
        }
        await authStore.addAlbumToList(
          store.getAlbumId,
          currentAlbumName.value,
          false
        );
        notifyExt.albumAdded();
      },
      async removeAlbumFromList() {
        if (!store.getAlbumId) {
          return;
        }

        const result = await dialogExt.removeAlbumFromList(
          currentAlbumName.value
        );
        if (!result) {
          return;
        }

        await authStore.removeAlbumFromList(store.getAlbumId);
        notifyExt.albumRemoved();
      },
      inList: computed((): boolean => {
        if (!store.getAlbumId) {
          return false;
        }
        return !!authStore.getAlbumList.find((x) => x.id === store.getAlbumId);
      }),
      syncMediaItems: store.syncMediaItems,
      disabled: computed(
        () => !currentAlbumId.value || currentAlbumId.value == ADD_ALBUM_ID
      ),
    };
  },
});
</script>
