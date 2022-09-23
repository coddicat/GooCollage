<template>
  <q-card
    class="q-ma-xs col-grow overflow-hidden"
    square
    style="cursor: pointer"
  >
    <transition :name="transition">
      <DynamicCanvas
        v-if="src"
        class="album-media-item__img"
        :key="albumItem?.id"
        :src="src"
        :fit="fit"
      >
      </DynamicCanvas>
    </transition>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AlbumItem } from '../types';
import DynamicCanvas from './DynamicCanvas.vue';

export default defineComponent({
  name: 'AlbumMediaItem',
  components: { DynamicCanvas },
  props: {
    item: Object,
    cache: Object,
    transition: String,
    fit: String,
  },
  computed: {
    src(): HTMLCanvasElement | undefined {
      if (!this.albumItem?.id) return undefined;
      const cache = this.cache as {
        [key: string]: HTMLCanvasElement;
      };
      const cacheItem = cache[this.albumItem.id];
      return cacheItem;
    },
    albumItem(): AlbumItem | undefined {
      return this.item as AlbumItem | undefined;
    },
  },
});
</script>

<style lang="scss">
.album-media-item {
  &__img {
    position: absolute;
    width: 100%;
    height: 100%;
  }
}
</style>
