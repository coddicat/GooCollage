<template>
  <q-img
    src="~/assets/user-panel.png"
    style="height: 180px"
    :img-style="{ filter: 'brightness(0.5)' }"
  >
    <div v-if="signed" class="absolute-bottom bg-transparent">
      <q-avatar size="56px" class="q-mb-sm">
        <q-img v-if="!!user?.photoURL" :src="user?.photoURL"></q-img>
        <q-icon v-else size="lg" name="sentiment_very_satisfied"></q-icon>
      </q-avatar>
      <div class="text-weight-bold">{{ user?.displayName }}</div>
      <div>{{ user?.email }}</div>
      <CurrentAlbumSelect></CurrentAlbumSelect>
    </div>
    <div v-else class="absolute-center bg-transparent">
      <q-btn
        @click="signin"
        icon="login"
        label="Sign in"
        color="primary"
      ></q-btn>
    </div>
    <ManageAccount v-if="signed"></ManageAccount>
  </q-img>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useAuthStore } from 'src/stores/auth-store';
import { mapState } from 'pinia';
import CurrentAlbumSelect from './CurrentAlbumSelect.vue';
import ManageAccount from './ManageAccount.vue';

export default defineComponent({
  name: 'CurrentUserMenu',
  components: {
    CurrentAlbumSelect,
    ManageAccount,
  },
  computed: {
    ...mapState(useAuthStore, {
      user: 'getFbUser',
      signed: 'getSigned',
    }),
  },
  methods: {
    signin() {
      this.$router.push('/login');
    },
  },
});
</script>
