<template>
  <q-card
    :disabled="disabled ? true : undefined"
    flat
    square
    class="q-ma-md column col-shrink cursor-pointer"
    @click="handler"
    style="width: 138px"
  >
    <div>
      <q-img
        class="rounded-borders"
        :src="coverPhotoBaseUrl"
        height="138px"
        width="138px"
        fit="cover"
      >
      </q-img>
    </div>
    <q-card-section class="q-py-sm q-pl-none">
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption> {{ mediaItemsCount ?? 0 }} items </q-item-label>
    </q-card-section>
  </q-card>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AlbumsBrowserPage',
  props: {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    mediaItemsCount: String,
    coverPhotoBaseUrl: String,
    disabled: Boolean,
  },
  methods: {
    async handler() {
      if (this.disabled) {
        return;
      }
      this.$emit('select');
    },
  },
});
</script>
