<template>
  <q-page
    class="column items-stretch justify-stretch no-wrap"
    :key="transition"
  >
    <template v-if="albumResult?.success && !albumResult?.passwordRequest">
      <div
        v-for="row in portrait ? columns : rows"
        :key="row"
        class="row items-stretch justify-evenly no-wrap col-grow"
      >
        <AlbumMediaItem
          v-for="col in portrait ? rows : columns"
          :key="`${col}_${row}`"
          :item="portrait ? getCard(row, col) : getCard(col, row)"
          :cache="cache"
          :transition="getTransition()"
          :fit="fit"
          @click="portrait ? clickHandler(row, col) : clickHandler(col, row)"
        >
        </AlbumMediaItem>
      </div>
      <ViewMediaItemDialog v-model="dialogItem"> </ViewMediaItemDialog>
    </template>
    <AlbumPasswordRequest v-else-if="albumResult?.passwordRequest">
    </AlbumPasswordRequest>
    <q-card
      v-else-if="!!albumResult"
      style="align-self: center"
      class="q-mt-lg q-mx-md"
    >
      <q-card-section>
        <div style="font-size: 20px">
          <q-icon name="error" color="negative" size="md"></q-icon>
          The album has been deleted or ceased to be public
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { useAlbumStore } from 'stores/album-store';
import { computed, defineComponent, ref } from 'vue';
import { mapState } from 'pinia';
import { Loading, QSpinnerGrid } from 'quasar';
import { AlbumItem, Transitions } from '../types';
import redirectNoAlbum from 'src/router/redirect-no-album';
import AlbumMediaItem from '../components/AlbumMediaItem.vue';
import ViewMediaItemDialog from 'src/components/ViewMediaItemDialog.vue';
import AlbumPasswordRequest from '../components/AlbumPasswordRequest.vue';

function shuffleArr<T>(array: T[]) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}
export default defineComponent({
  name: 'AlbumPage',
  components: {
    AlbumMediaItem,
    ViewMediaItemDialog,
    AlbumPasswordRequest,
  },
  computed: {
    ...mapState(useAlbumStore, {
      columns: 'getColumns',
      rows: 'getRows',
      items: 'getItems',
      randomGridOrder: 'getRandomGridOrder',
      transition: 'getTransition',
      orientation: 'getOrientation',
      fit: 'getFit',
      cache: 'cache',
      interval: 'getInterval',
    }),
    currentTimeIndex(): number | undefined {
      if (!this.currentTime || !this.interval) {
        return undefined;
      }

      const seconds = Math.floor(
        (this.currentTime.getTime() - this.startTime.getTime()) / 1000
      );
      return Math.floor(seconds / this.interval);
    },
  },
  props: ['albumId'],
  setup() {
    const store = useAlbumStore();
    const startTime = new Date(1986, 4, 26, 0, 0, 0); //my bod
    const randomGrid = ref();
    const shuffleRandomGrid = () => {
      if (!store.getColumns || !store.getRows) {
        return;
      }
      randomGrid.value = shuffleArr([
        ...Array(store.getColumns * store.getRows).keys(),
      ]);
    };
    shuffleRandomGrid();

    const portrait = ref();
    const setPortrait = () => {
      portrait.value =
        store.getOrientation && screen.availHeight > screen.availWidth;
    };
    window.addEventListener('orientationchange', setPortrait, false);
    setPortrait();

    const currentTime = ref(undefined as Date | undefined);
    const timer = ref(undefined as NodeJS.Timeout | undefined);

    return {
      dialogItem: ref(undefined as AlbumItem | undefined),
      startTime,
      currentTime,
      timer,
      randomGrid,
      portrait,
      shuffleRandomGrid,
      setPortrait,
      error: ref(false),
      albumResult: computed(() => store.albumResult),
    };
  },
  watch: {
    albumId() {
      if (this.albumId) {
        this.loadAlbum();
        return;
      }
      this.$router.replace(redirectNoAlbum());
    },
    columns() {
      this.shuffleRandomGrid();
    },
    rows() {
      this.shuffleRandomGrid();
    },
    orientation() {
      this.setPortrait();
    },
  },
  async mounted() {
    await this.loadAlbum();
  },
  methods: {
    clickHandler(col: number, row: number) {
      const card = this.getCard(col, row);
      if (!card) {
        return;
      }
      this.dialogItem = card;
    },
    getTransition() {
      if (this.transition !== 'RANDOM') {
        return `q-transition--${this.transition}`;
      }
      const transition =
        Transitions[Math.floor(Math.random() * Transitions.length)];
      return `q-transition--${transition}`;
    },
    getCard(col: number, row: number): AlbumItem | undefined {
      if (!this.currentTimeIndex || !this.columns || !this.rows) {
        return undefined;
      }

      let i = (row - 1) * this.columns + col - 1;
      if (this.randomGridOrder) {
        i = this.randomGrid[i];
      }
      const c = this.columns * this.rows;

      if (i > this.items.length) {
        return undefined;
      }

      if (c >= this.items.length) {
        return this.items[i];
      }

      const x = this.currentTimeIndex;
      const s = (Math.floor((x - 1 - i) / c) + 1) * c + i;

      return this.items[s % this.items.length];
    },
    startTimer() {
      this.stopTimer();
      this.currentTime = new Date();
      this.timer = setTimeout(() => {
        this.startTimer();
      }, 1000);
    },
    stopTimer() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
    },
    async loadAlbum(refresh?: boolean) {
      try {
        this.error = false;
        Loading.show({
          message: 'Loading the album data.',
          spinner: QSpinnerGrid,
        });
        this.stopTimer();
        const store = useAlbumStore();
        const albumId = this.albumId as string | undefined;
        await store.setAlbumId(albumId, refresh);
        this.startTimer();
      } catch (err) {
        console.error(err);
      } finally {
        Loading.hide();
      }
    },
  },
});
</script>
