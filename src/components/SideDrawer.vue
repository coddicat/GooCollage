<template>
  <q-drawer
    v-model="model"
    elevated
    show-if-above
    bordered
    side="right"
    :breakpoint="500"
  >
    <CurrentUserMenu></CurrentUserMenu>
    <q-list>
      <AlbumControlPanel :owner="owner" :signed="signed"></AlbumControlPanel>
      <AlbumProperties v-if="owner && hasProperties"></AlbumProperties>
      <AlbumPublicPanel :owner="owner"></AlbumPublicPanel>
    </q-list>
  </q-drawer>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useAuthStore } from 'src/stores/auth-store';
import { useAlbumStore } from 'src/stores/album-store';
import CurrentUserMenu from './CurrentUserMenu.vue';
import AlbumControlPanel from './AlbumControlPanel.vue';
import AlbumPublicPanel from './AlbumPublicPanel.vue';
import AlbumProperties from './AlbumProperties.vue';

export default defineComponent({
  name: 'SideDrawer',
  props: {
    modelValue: Boolean,
  },
  components: {
    CurrentUserMenu,
    AlbumControlPanel,
    AlbumPublicPanel,
    AlbumProperties,
  },
  setup() {
    const authStore = useAuthStore();
    const albumStore = useAlbumStore();
    const owner = computed(
      (): boolean =>
        !!albumStore.getAlbumUid &&
        authStore.getFbUser?.uid === albumStore.getAlbumUid
    );
    const signed = computed((): boolean => authStore.getSigned);
    const hasProperties = computed(() => !!albumStore.getProperties);
    return {
      owner,
      signed,
      hasProperties,
    };
  },
  computed: {
    model: {
      get(): boolean {
        return this.modelValue;
      },
      set(val: boolean) {
        this.$emit('update:modelValue', val);
      },
    },
  },
});
</script>

<style lang="scss">
.q-drawer__content {
  overflow-y: scroll;
  width: auto !important;
  //margin-right: -5px;

  scrollbar-gutter: auto;
  &::-webkit-scrollbar {
    //max-width: 5px;
    max-width: 0;
  }

  &::-webkit-scrollbar-thumb {
    background: #629bf3;
    //border-radius: 5px;
  }
}
</style>
