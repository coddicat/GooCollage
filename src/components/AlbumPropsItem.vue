<template>
  <q-item dense>
    <q-item-section v-if="section">
      <q-item-label caption>{{ label }}</q-item-label>
    </q-item-section>
    <q-item-section :side="section">
      <q-item-label v-if="!!label && !section" caption>
        {{ label }}
      </q-item-label>
      <slot></slot>
    </q-item-section>
  </q-item>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AlbumPropsItem',
  props: {
    label: String,
    section: Boolean,
  },
});
</script>
