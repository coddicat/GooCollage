<template>
  <q-dialog v-model="model">
    <q-card>
      <q-card-section class="row">
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
import { Dialog, Loading, QSpinnerGrid } from 'quasar';
import googleApp from 'src/google';
import { useAuthStore } from 'src/stores/auth-store';
import { defineComponent } from 'vue';
import { signOut, getAuth } from 'firebase/auth';
import { useAlbumStore } from 'src/stores/album-store';
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
          Dialog.create({
            dark: true,
            title: 'Invalid access',
            message: 'Something wrong, try again',
          });
          return;
        }
      } finally {
        Loading.hide();
      }
    },
    async revokeAccess() {
      Dialog.create({
        dark: true,
        message: 'Revoke google access',
        title: 'Are you sure?',
        cancel: true,
      }).onOk(async () => {
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
      });
    },
    async deleteAccountHandler() {
      Dialog.create({
        dark: true,
        message:
          'All data will be lost forever. Delete this account and all relative data?',
        title: 'Are you sure?',
        cancel: true,
      }).onOk(async () => {
        try {
          Loading.show({
            message: 'Deleting Account.',
            spinner: QSpinnerGrid,
            spinnerColor: 'negative',
          });
          const store = useAlbumStore();
          store.clearData();
          store.destroy();
          await this.deleteAccount();
        } finally {
          Loading.hide();
          await signOut(auth);
          this.$router.replace('./login');
        }
      });
    },
  },
});
</script>
