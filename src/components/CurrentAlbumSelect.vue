<template>
  <q-select
    outlined
    bg-color="white"
    v-model="currentAlbum"
    :options="albumOptions"
    label="Album"
    dense
    option-value="id"
    option-label="name"
    emit-value
    map-options
    :display-value="currentAlbumName"
  >
    <template v-slot:option="{ itemProps, opt }">
      <q-item v-bind="itemProps" class="current-album-select__item">
        <q-item-section>
          <q-item-label
            v-if="opt.id === ADD_ALBUM_ID"
            class="current-album-select__label current-album-select__label--add"
          >
            {{ opt.name }}
          </q-item-label>
          <q-item-label v-else class="current-album-select__label">
            {{ opt.name }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon
            v-if="opt.id === ADD_ALBUM_ID"
            color="red"
            name="library_add"
          ></q-icon>
          <q-icon v-else-if="!opt.owner" name="people"></q-icon>
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:append>
      <q-icon v-if="currentShared" name="people" />
      <q-icon v-else-if="currentAddAlbum" color="red" name="library_add" />
    </template>
    <template v-slot:selected-item="scope">
      <q-item-label
        v-if="currentAddAlbum"
        class="current-album-select__label current-album-select__label--add"
      >
        {{ scope.opt.name }}
      </q-item-label>
      <q-item-label v-else class="current-album-select__label">
        {{ scope.opt?.name ?? publicData?.name }}
      </q-item-label>
    </template>
  </q-select>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useAuthStore } from 'src/stores/auth-store';
import { useAlbumStore } from 'stores/album-store';
import { useRouter } from 'vue-router';
import { ADD_ALBUM_ID } from 'src/consts';

export default defineComponent({
  name: 'CurrentAlbumSelect',
  setup() {
    const albumStore = useAlbumStore();
    const authStore = useAuthStore();
    const router = useRouter();
    const addAlbumOption = {
      id: ADD_ALBUM_ID,
      name: 'Add an album',
    };

    const albumOptions = computed(() => {
      const albums = authStore.getAlbumList.slice();
      albums.sort(
        (x, y) => (x.created?.nanoseconds ?? 0) - (y.created?.nanoseconds ?? 0)
      );
      // const publicData = albumStore.getPublic;
      // const currentAlbumId = albumStore.getAlbumId;
      // if (
      //   publicData &&
      //   albums.findIndex((x) => x.id === currentAlbumId) === -1
      // ) {
      //   const publicAlbumOption = {
      //     id: currentAlbumId,
      //     name: publicData.name,
      //     temp: true,
      //   };
      //   return [publicAlbumOption, ...albums, addAlbumOption];
      // }
      return [...albums, addAlbumOption];
    });
    const currentAlbum = computed({
      get: (): string | undefined => albumStore.getAlbumId,
      set: (albumId: string | undefined) => {
        if (!albumId || albumId == ADD_ALBUM_ID) {
          router.replace('/albums');
          return;
        }
        router.push({ name: 'Home', params: { albumId } });
      },
    });

    const publicData = computed(() => albumStore.getPublic);

    return {
      publicData,
      ADD_ALBUM_ID,
      albumOptions,
      currentAlbum,
      currentShared: computed(() => {
        return (
          albumStore.getAlbumUid != authStore.getFbUser?.uid &&
          albumStore.getAlbumId != ADD_ALBUM_ID
        );
      }),
      currentAddAlbum: computed(() => albumStore.getAlbumId === ADD_ALBUM_ID),
      currentAlbumName: computed(() => {
        const opt = albumOptions.value.find((x) => x.id === currentAlbum.value);
        if (opt) {
          return opt.name;
        }
        return albumStore.getAlbumName; //in case the album is shared
      }),
    };
  },
});
</script>

<style lang="scss">
.current-album-select {
  &__item {
    max-width: 300px;
  }
  &__label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &--add {
      color: red;
    }
  }
}
</style>
