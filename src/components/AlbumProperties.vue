<template>
  <AlbumPropsItem>
    <q-select
      dense
      v-model="transition"
      :disable="disabled"
      :options="transitionOptions"
      label="Transition"
      caption
    />
  </AlbumPropsItem>

  <AlbumPropsItem>
    <q-select
      dense
      v-model="fit"
      :disable="disabled"
      :options="fitOptions"
      label="Fit"
      caption
    />
  </AlbumPropsItem>

  <AlbumPropsItem :label="`Columns: ${columns}`" class="q-mt-md">
    <q-slider :disable="disabled" markers v-model="columns" :min="1" :max="5" />
  </AlbumPropsItem>

  <AlbumPropsItem :label="`Rows: ${rows}`">
    <q-slider :disable="disabled" markers v-model="rows" :min="1" :max="5" />
  </AlbumPropsItem>

  <AlbumPropsItem :label="`Interval: ${interval} sec`">
    <q-slider
      :disable="disabled"
      markers
      v-model="interval"
      :min="1"
      :max="4"
    />
  </AlbumPropsItem>

  <AlbumPropsItem label="Random Grid Order" section>
    <q-toggle dense v-model="randomGridOrder" :disable="disabled" />
  </AlbumPropsItem>

  <AlbumPropsItem label="Mobile orientation" section>
    <q-toggle dense v-model="orientation" :disable="disabled" />
  </AlbumPropsItem>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useAlbumStore } from 'stores/album-store';
import { Fit, Transition, Transitions } from 'src/types';
import { ADD_ALBUM_ID } from 'src/consts';
import { debounce } from 'lodash';
import AlbumPropsItem from './AlbumPropsItem.vue';

export default defineComponent({
  name: 'AlbumProperties',
  components: {
    AlbumPropsItem,
  },
  setup() {
    const store = useAlbumStore();
    const currentAlbumId = computed((): string | undefined => store.getAlbumId);
    const setProperty = debounce(store.setProperty, 100);
    const setPropertyDelay = debounce(store.setProperty, 300);

    return {
      currentAlbumId,
      fit: computed({
        get: (): Fit => store.getFit ?? 'cover',
        set: (fit: Fit) => setProperty('fit', fit),
      }),
      fitOptions: ['cover', 'fill', 'contain'],
      disabled: computed(
        () => !currentAlbumId.value || currentAlbumId.value == ADD_ALBUM_ID
      ),
      rows: computed({
        get: (): number => store.getRows ?? 3,
        set: (rows: number) => setPropertyDelay('rows', rows),
      }),
      columns: computed({
        get: (): number => store.getColumns ?? 3,
        set: (columns: number) => setPropertyDelay('columns', columns),
      }),
      transitionOptions: ['RANDOM', ...Transitions] as Transition[],
      transition: computed({
        get: (): Transition => store.getTransition ?? 'fade',
        set: (transition: Transition) => setProperty('transition', transition),
      }),
      randomGridOrder: computed({
        get: (): boolean => store.getRandomGridOrder ?? false,
        set: (randomGridOrder) =>
          setProperty('randomGridOrder', randomGridOrder),
      }),
      orientation: computed({
        get: (): boolean => store.getOrientation ?? true,
        set: (orientation: boolean) => setProperty('orientation', orientation),
      }),
      interval: computed({
        get: (): number => store.getInterval ?? 2,
        set: (interval: number) => setPropertyDelay('interval', interval),
      }),
    };
  },
});
</script>
