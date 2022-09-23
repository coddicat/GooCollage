<template>
  <div class="absolute-top-right bg-transparent">
    <q-btn flat round icon="manage_accounts">
      <q-menu fit auto-close>
        <q-list style="min-width: 100px">
          <q-item clickable @click="signout">
            <q-item-section>Sing out</q-item-section>
            <q-item-section side>
              <q-icon name="logout"></q-icon>
            </q-item-section>
          </q-item>
          <q-item clickable @click="settings = true">
            <q-item-section>Settings</q-item-section>
            <q-item-section side>
              <q-icon name="settings"></q-icon>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item clickable disable>
            <q-item-section>Help & Feedback</q-item-section>
            <q-item-section side>
              <q-icon name="help"></q-icon>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
    <AccountSettings v-model="settings"></AccountSettings>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { signOut, getAuth } from 'firebase/auth';
import { Dialog } from 'quasar';
import AccountSettings from './AccountSettings.vue';
import { useAlbumStore } from 'src/stores/album-store';
const auth = getAuth();

export default defineComponent({
  name: 'ManageAccount',
  setup() {
    return {
      settings: ref(false),
    };
  },
  methods: {
    signout() {
      Dialog.create({
        dark: true,
        message: 'Signing out',
        title: 'Are you sure?',
        cancel: true,
      }).onOk(async () => {
        const store = useAlbumStore();
        store.clearData();
        store.destroy();

        await signOut(auth);
        this.$router.replace('./login');
      });
    },
    signin() {
      this.$router.push('/login');
    },
  },
  components: { AccountSettings },
});
</script>
