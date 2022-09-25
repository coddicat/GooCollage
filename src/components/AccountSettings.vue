<template>
  <q-dialog v-model="model">
    <q-card>
      <q-card-section class="row q-mb-none q-pb-none">
        <div class="text-h6">Settings</div>
        <q-space></q-space>
        <q-btn
          class="account-settings__close"
          icon="close"
          round
          dense
          color="warning"
          v-close-popup
        />
      </q-card-section>
      <q-card-section>
        <q-list>
          <q-item>
            <q-btn
              class="full-width"
              color="primary"
              @click="authorize"
              icon="verified_user"
              label="Authorize Google Access"
            >
            </q-btn>
          </q-item>
          <q-item>
            <q-btn
              class="full-width"
              :disable="user?.revoked"
              @click="revokeAccess"
              label="Revoke Google Access"
              icon="gpp_bad"
              color="warning"
            ></q-btn>
          </q-item>
          <q-item>
            <q-btn
              class="full-width"
              color="negative"
              label="Delete Account"
              icon="delete"
              @click="deleteAccountHandler"
            ></q-btn>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { mapActions, mapState } from 'pinia';
import { Loading, QSpinnerGrid } from 'quasar';
import googleApp from 'src/google';
import { useAuthStore } from 'src/stores/auth-store';
import { defineComponent } from 'vue';
import { signOut, getAuth } from 'firebase/auth';
import { useAlbumStore } from 'src/stores/album-store';
import dialogExt from 'src/extensions/dialog-ext';
const auth = getAuth();

export default defineComponent({
  name: 'AccountSettings',
  computed: {
    ...mapState(useAuthStore, { user: 'getDbUser' }),
    model: {
      get(): boolean {
        return this.modelValue;
      },
      set(val: boolean) {
        this.$emit('update:modelValue', val);
      },
    },
  },
  props: {
    modelValue: Boolean,
  },
  methods: {
    ...mapActions(useAuthStore, ['revokeToken', 'deleteAccount']),
    async authorize() {
      try {
        Loading.show({
          message: 'Please stand by...',
          spinner: QSpinnerGrid,
        });
        const response = await googleApp.signin();

        if (!response.code) {
          dialogExt.invalidAccess();
          return;
        }
      } finally {
        Loading.hide();
      }
    },
    async revokeAccess() {
      const result = await dialogExt.revokeAccess();
      if (!result) {
        return;
      }

      try {
        Loading.show({
          message: 'Revoking access.',
          spinner: QSpinnerGrid,
          spinnerColor: 'negative',
        });
        await this.revokeToken();
      } finally {
        Loading.hide();
      }
    },
    async deleteAccountHandler() {
      const result = await dialogExt.deleteAccount();
      if (!result) {
        return;
      }

      try {
        Loading.show({
          message: 'Deleting Account.',
          spinner: QSpinnerGrid,
          spinnerColor: 'negative',
        });
        const store = useAlbumStore();
        store.destroy();
        store.clearData();
        const authStore = useAuthStore();
        authStore.destroy();
        await this.deleteAccount();
      } finally {
        Loading.hide();
        await signOut(auth);
        this.$router.replace('./login');
      }
    },
  },
});
</script>
