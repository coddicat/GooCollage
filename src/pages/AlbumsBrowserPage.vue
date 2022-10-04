<template>
  <q-page class="column q-pa-md items-start">
    <div v-if="googleAlbums && googleAlbums.length > 0" class="row items-start">
      <AlbumsBrowserItem
        v-for="googleAlbum in googleAlbums"
        :key="googleAlbum.id"
        :id="googleAlbum.id"
        :media-items-count="googleAlbum.mediaItemsCount"
        :title="googleAlbum.title"
        :cover-photo-base-url="googleAlbum.coverPhotoBaseUrl"
        :disabled="googleIds.indexOf(googleAlbum.id) >= 0"
        @select="handler(googleAlbum)"
      ></AlbumsBrowserItem>
    </div>
    <div v-else-if="!loading" class="absolute-center">
      <span class="text-subtitle1"
        >The list of albums is empty, create albums in your Google Photo account
        <a href="https://photos.google.com/albums" target="_blank"
          >https://photos.google.com/albums</a
        >
      </span>
      <div class="q-ma-sx">
        <q-btn
          flat
          label="Refresh"
          icon="refresh"
          color="primary"
          @click="refresh"
        ></q-btn>
      </div>
    </div>
    <div v-if="nextPageToken" class="flex full-width flex-center col-shrink">
      <q-btn color="primary" @click="loadHandler"> Load more </q-btn>
    </div>
  </q-page>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { getFunctions, httpsCallable } from 'firebase/functions';
import firebaseApp from '../firebase';
import { Loading, QSpinnerGrid } from 'quasar';
import { mapActions } from 'pinia';
import { useAlbumStore } from 'stores/album-store';
import { GoogleAlbumInfo } from 'src/types';
import { useAuthStore } from 'src/stores/auth-store';
import AlbumsBrowserItem from '../components/AlbumsBrowserItem.vue';
import dialogExt from 'src/extensions/dialog-ext';
const functions = getFunctions(firebaseApp);
const getGoogleAlbums = httpsCallable(functions, 'getGoogleAlbums');

export default defineComponent({
  name: 'AlbumsBrowserPage',
  components: {
    AlbumsBrowserItem,
  },
  setup() {
    const googleAlbums = ref([] as GoogleAlbumInfo[]);
    const nextPageToken = ref(undefined as string | undefined);

    return {
      loading: ref(true),
      googleAlbums,
      nextPageToken,
      googleIds: ref([] as string[]),
    };
  },
  async mounted() {
    try {
      Loading.show({
        message: 'Please stand by',
        spinner: QSpinnerGrid,
      });
      this.emitter.on('refresh', this.refresh);
      const authStore = useAuthStore();
      this.googleIds = await authStore.loadGooglesAlbumIds();
    } catch {
      Loading.hide();
    } finally {
      await this.loadHandler();
      await dialogExt.browseAlbum();
    }
  },
  unmounted() {
    this.emitter.off('refresh', this.refresh);
  },
  methods: {
    ...mapActions(useAlbumStore, {
      addAlbum: 'addAlbum',
    }),
    refresh() {
      this.googleAlbums = [];
      this.nextPageToken = undefined;
      this.loadHandler();
    },
    async handler(googleAlbum: { id: string; title: string }) {
      try {
        Loading.show({
          message: 'Please stand by...',
          spinner: QSpinnerGrid,
        });
        const albumId = await this.addAlbum(googleAlbum.id, googleAlbum.title);
        await this.$router.push({
          name: 'Home',
          params: { albumId },
          //replace: true,
        });
      } catch (error) {
        console.error(error);
      } finally {
        Loading.hide();
      }
    },
    async loadHandler() {
      try {
        Loading.show({
          message: 'Please stand by',
          spinner: QSpinnerGrid,
        });
        this.loading = true;
        const response = await getGoogleAlbums({
          nextPageToken: this.nextPageToken,
        });
        const data = response.data as {
          albums: GoogleAlbumInfo[];
          nextPageToken: string;
        };
        this.googleAlbums = [...this.googleAlbums, ...data.albums];
        this.nextPageToken = data.nextPageToken;
      } finally {
        Loading.hide();
        this.loading = false;
      }
    },
  },
});
</script>
