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
import { Dialog, Loading, Notify, QSpinnerGrid } from 'quasar';
import { useRouter } from 'vue-router';

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
      deleteAlbum() {
        if (!store.getAlbumId) {
          return;
        }

        Dialog.create({
          dark: true,
          message: `Deletion '${currentAlbumName.value}' album`,
          title: 'Are you sure?',
          cancel: true,
        }).onOk(async () => {
          if (!store.getAlbumId) {
            return;
          }

          try {
            Loading.show({
              message: 'Album deletion.',
              spinner: QSpinnerGrid,
              spinnerColor: 'negative',
            });
            await store.deleteAlbum();
            await router.replace('/');
            Notify.create({
              message: 'The album has been deleted.',
              timeout: 2000,
              position: 'bottom-left',
              type: 'warning',
            });
          } finally {
            Loading.hide();
          }
        });
      },
      rename() {
        Dialog.create({
          dark: true,
          title: 'Prompt',
          message: "Enter the album's display name:",
          prompt: {
            model: currentAlbumName.value,
          },
          cancel: true,
        }).onOk(async (name: string): Promise<void> => {
          await store.renameAlbum(name);
          Notify.create({
            message: 'The album has been renamed.',
            timeout: 2000,
            position: 'bottom-left',
            type: 'warning',
          });
        });
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
        Notify.create({
          message: 'The album has been added to your list.',
          timeout: 2000,
          position: 'bottom-left',
          type: 'warning',
        });
      },
      async removeAlbumFromList() {
        if (!store.getAlbumId) {
          return;
        }

        Dialog.create({
          dark: true,
          message: `Removing '${currentAlbumName.value}' album`,
          title: 'Are you sure?',
          cancel: true,
        }).onOk(async () => {
          if (!store.getAlbumId) {
            return;
          }
          await authStore.removeAlbumFromList(store.getAlbumId);
          Notify.create({
            message: 'The album has been removed from your list.',
            timeout: 2000,
            position: 'bottom-left',
            type: 'warning',
          });
        });
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
