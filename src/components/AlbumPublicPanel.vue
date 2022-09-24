<template>
  <AlbumPropsItem v-if="owner" label="Public" section>
    <q-toggle dense v-model="shared" :disable="disabled" />
  </AlbumPropsItem>

  <AlbumPropsItem v-if="shared && owner">
    <q-input
      v-model="password"
      dense
      :type="isPwd ? 'password' : 'text'"
      label="Password"
      :disable="disabled"
    >
      <template v-slot:append>
        <q-icon
          :name="isPwd ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          :disable="disabled"
          @click="isPwd = !isPwd"
        />
      </template>
    </q-input>
  </AlbumPropsItem>

  <AlbumPropsItem v-if="shared && !disabled">
    <div class="full-width text-center">
      <q-btn
        class="q-mb-sm full-width"
        color="primary"
        icon="content_copy"
        flat
        @click="copyShared"
        :disable="disabled"
      >
        <span
          class="ellipsis full-width text-right text-lowercase"
          style="direction: rtl"
        >
          {{ qrcode }}
        </span>
      </q-btn>
      <QrcodeVue :value="qrcode" :size="180" level="H"></QrcodeVue>
    </div>
  </AlbumPropsItem>
</template>

<script lang="ts">
import { computed, defineAsyncComponent, defineComponent, ref } from 'vue';
import { useAlbumStore } from 'stores/album-store';
import { ADD_ALBUM_ID } from 'src/consts';
import copy from 'copy-to-clipboard';
import { debounce } from 'lodash';
import { Notify } from 'quasar';
import AlbumPropsItem from './AlbumPropsItem.vue';
import notifications from 'src/notifications';

export default defineComponent({
  name: 'AlbumPublicPanel',
  components: {
    AlbumPropsItem,
    QrcodeVue: defineAsyncComponent(() => import('qrcode.vue')),
  },
  props: {
    owner: Boolean,
  },
  setup() {
    const store = useAlbumStore();
    const currentAlbumId = computed((): string | undefined => store.getAlbumId);
    const setPublic = debounce(store.setPublic, 100);
    const setPassword = debounce(store.setPassword, 300);

    return {
      isPwd: ref(true),
      shared: computed({
        get: (): boolean => store.getPublic?.status == true,
        set: async (value: boolean) => {
          const shared = value && (await notifications.publicAlbum());
          setPublic(shared);
        },
      }),
      password: computed({
        get: (): string => store.getPassword ?? '',
        set: (password: string) => setPassword(password),
      }),
      qrcode: computed(() => {
        const uri = `https://enqueuecard.web.app/${store.getAlbumId}`;
        return uri;
      }),
      disabled: computed(
        () => !currentAlbumId.value || currentAlbumId.value == ADD_ALBUM_ID
      ),
    };
  },
  methods: {
    async copyShared() {
      copy(this.qrcode);
      Notify.create({
        message: "The album's link has been copied.",
        timeout: 2000,
        position: 'bottom-left',
        type: 'info',
      });
    },
  },
});
</script>
