<template>
  <q-dialog v-model="model" maximized>
    <q-card>
      <q-card-section class="full-height overflow-hidden">
        <div class="view-media-item__wrapper">
          <DynamicCanvas
            v-if="model && canvas"
            class="view-media-item__img"
            :src="canvas"
            fit="contain"
          >
          </DynamicCanvas>
          <q-btn
            class="view-media-item__close"
            icon="close"
            round
            dense
            color="warning"
            v-close-popup
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { useAlbumStore } from 'stores/album-store';
import { defineComponent, ref } from 'vue';
import { mapState } from 'pinia';
import DynamicCanvas from 'src/components/DynamicCanvas.vue';

export default defineComponent({
  name: 'ViewMediaItemDialog',
  components: {
    DynamicCanvas,
  },
  setup() {
    return {
      canvas: ref(),
      dialog: ref(false),
    };
  },
  computed: {
    ...mapState(useAlbumStore, {
      cache: 'cache',
    }),
    model: {
      get(): boolean {
        return this.dialog;
      },
      set(val: boolean) {
        if (val) return;
        this.dialog = false;
        this.$emit('update:modelValue', undefined);
      },
    },
  },
  props: {
    modelValue: Object,
  },
  watch: {
    modelValue() {
      this.handler();
    },
  },
  methods: {
    handler() {
      if (!this.modelValue) {
        this.dialog = false;
        return;
      }

      const cacheItem = this.cache[this.modelValue.id];
      if (!cacheItem) {
        return;
      }
      const canvas = cacheItem.cloneNode(true) as HTMLCanvasElement;
      const context2 = canvas.getContext('2d');
      if (!context2) {
        return;
      }
      context2.drawImage(cacheItem, 0, 0);
      this.canvas = canvas;
      this.dialog = true;
    },
  },
});
</script>
<style lang="scss">
.view-media-item {
  &__wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }
  &__img {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
  &__close {
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>
