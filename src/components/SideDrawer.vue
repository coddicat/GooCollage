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
      <q-item v-if="addingAlbum">
        <q-item-section>
          <p>
            Select an album from your Google library to make a live collage.
          </p>
          <p>
            Please note that at the moment the application only retrieves the 50
            latest media items.
          </p>
          <p>
            Synchronization with the Google Media Library occurs automatically
            after a 60-minute cache expires.
          </p>
          <p>
            If you have any questions or issues, please contact our
            <a
              href="https://github.com/coddicat/GooCollage/discussions"
              target="_blank"
              >Discussions</a
            >
            and
            <a
              href="https://github.com/coddicat/GooCollage/wiki"
              target="_blank"
              >Wiki</a
            >
            for help, or send us
            <a href="mailto:goocollage@gmail.com" target="_blank"
              >an Email goocollage@gmail.com</a
            >
          </p>
        </q-item-section>
      </q-item>
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
import { ADD_ALBUM_ID } from 'src/consts';

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
    const addingAlbum = computed(
      (): boolean => albumStore.getAlbumId === ADD_ALBUM_ID
    );
    return {
      owner,
      signed,
      hasProperties,
      addingAlbum,
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
