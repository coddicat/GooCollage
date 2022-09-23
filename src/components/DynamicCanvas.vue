<template>
  <div ref="container"></div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DynamicCanvas',
  props: {
    src: {
      type: HTMLCanvasElement,
      required: true,
    },
    fit: String,
  },
  watch: {
    fit() {
      // eslint-disable-next-line vue/no-mutating-props
      this.src.style.objectFit = this.fit ?? 'cover';
    },
  },
  mounted() {
    const parent = this.$refs.container as HTMLDivElement;
    // eslint-disable-next-line vue/no-mutating-props
    this.src.style.objectFit = this.fit ?? 'cover';
    parent.appendChild(this.src);
  },
});
</script>
