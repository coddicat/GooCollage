<template>
  <q-page
    class="row"
    style="
      justify-content: space-around;
      align-content: flex-start;
      flex-direction: row-reverse;
      padding-top: 10px;
      max-width: 1000px;
      margin-left: auto !important;
      margin-right: auto !important;
    "
  >
    <div
      class="row items-center"
      style="
        margin: 15px 20px 0 20px;
        flex-shrink: 0;
        flex-grow: 0;
        height: fit-content;
      "
    >
      <q-btn
        v-if="signed"
        label="Home"
        color="primary"
        outline
        rounded
        icon="home"
        :to="{ name: 'Home' }"
      >
      </q-btn>
      <q-btn
        v-else
        label="Login"
        color="primary"
        outline
        rounded
        icon="login"
        :to="{ name: 'Login' }"
      >
      </q-btn>
    </div>

    <div
      class="column"
      style="flex-grow: 1; margin-left: 20px; max-width: 500px"
    >
      <h5 style="margin-bottom: 10px; margin-top: 5px">
        <img src="~/assets/logo.svg" style="height: 50px; margin-right: 5px" />
        <b>GooCollage</b> is a Web application with which you can easily and
        quickly make a live collage from your Google Album and share it with
        your friends.
      </h5>
      <ul>
        <li>Sign in with Google</li>
        <li>Grand access to read your albums content</li>
        <li>Select any album from your google library</li>
        <li>Adjust your collage</li>
        <li>Make it public</li>
        <li>Share the link or qrcode</li>
        <li>Watch it in fullscreen mode</li>
      </ul>
      <p>
        The live collage is a customizable grid, where each cell displays photos
        from your Google album and with a slight delay, these photos change one
        by one. A particular collage on different devices will show the same
        photos at the same time.
      </p>
      <div
        class="row"
        style="
          justify-content: space-around;
          align-items: center;
          margin-bottom: 20px;
        "
      >
        <img src="~/assets/gooCollage1.gif" style="width: 250px" />
      </div>
      <p>
        This service uses the open Google API to access your media resources,
        while the service itself does not store the media data itself on its
        side, at any time you can revoke the access to your media data.
      </p>
      <p>
        <a class="login-page__link" href="./termsOfService.html" target="_blank"
          >Terms of Service</a
        >,

        <a class="login-page__link" href="./privacyPolicy.html" target="_blank"
          >Privacy Policy</a
        >
      </p>
    </div>
  </q-page>
</template>
<script lang="ts">
import { mapState } from 'pinia';
import { useAuthStore } from 'src/stores/auth-store';
import { defineComponent, ref } from 'vue';
import { getCurrentUser } from '../firebase';

export default defineComponent({
  name: 'AboutPage',
  setup() {
    return { signed: ref(false) };
  },
  async mounted() {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.isAnonymous) {
      this.signed = false;
    } else {
      this.signed = true;
    }
  },
  computed: {
    ...mapState(useAuthStore, {
      dbUser: 'getDbUser',
    }),
  },
});
</script>
