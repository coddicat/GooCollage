<template>
  <q-page
    class="login-page window-width row"
    style="
      justify-content: center;
      align-content: flex-start;
      flex-direction: row-reverse;
      padding-top: 5px;
    "
  >
    <q-card
      class="column items-center"
      style="
        width: 350px;
        margin: 15px 20px 0 20px;
        flex-shrink: 0;
        flex-grow: 0;
        height: fit-content;
      "
    >
      <div style="margin: 25px">
        <img src="~/assets/logo-text.svg" style="height: 150px" />
      </div>
      <q-btn
        @click="googleSignin"
        padding="0"
        align="left"
        style="background-color: #4285f4"
        no-caps
        no-wrap
      >
        <img
          src="~/assets/google-logo.png"
          height="50"
          class="login-page__btn__img"
        />
        <span class="login-page__btn__label">Sign in with Google</span>
      </q-btn>
      <p class="text-center login-page__disclaimer">
        By continuing, you are indicating that you accept our
        <a
          class="login-page__link"
          href="https://www.termsofservicegenerator.net/live.php?token=9ggAXY3UvRvB0s7Kw3qmkK1A25mkUOyz"
          target="_blank"
          >Terms of Service</a
        >
        and
        <a
          class="login-page__link"
          href="https://www.privacypolicygenerator.info/live.php?token=PENTeaQqCS7u5VJnphXzYsxrv5yK6SB1"
          target="_blank"
          >Privacy Policy</a
        >.
      </p>
    </q-card>
    <div
      class="column"
      style="flex-grow: 1; margin-left: 20px; max-width: 500px"
    >
      <h5 style="margin-bottom: 10px">
        Make a live collage from your Google Album
      </h5>
      <ul>
        <li>Sign in with Google</li>
        <li>Grand access to read your albums content</li>
        <li>Select any album from your google library</li>
        <li>Setup your collage</li>
        <li>Make it public</li>
        <li>Share the link or qrcode</li>
        <li>Watch in fullscreen mode</li>
      </ul>
      <div
        class="row"
        style="justify-content: space-around; align-items: center"
      >
        <img src="~/assets/gooCollage1.gif" style="width: 250px" />
        <img src="~/assets/gooCollage2.gif" style="height: 250px" />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
  getAuth,
  GoogleAuthProvider,
  linkWithCredential,
  signInWithCredential,
  UserCredential,
} from 'firebase/auth';
import { mapActions, mapState } from 'pinia';
import { useAuthStore } from 'stores/auth-store';
import { Loading, QSpinnerGrid } from 'quasar';
import googleApp, { getRedirectUrl } from '../google';
import { getCurrentUser } from '../firebase';
import dialogExt from 'src/extensions/dialog-ext';

const auth = getAuth();

export default defineComponent({
  name: 'LoginPage',
  async mounted() {
    try {
      Loading.show({
        message: 'Please stand by...',
        spinner: QSpinnerGrid,
      });

      const code = this.$route.query.code as string | undefined;
      if (!!code) {
        const scope = this.$route.query.scope as string | undefined;
        await this.continuteLogin(code, scope);
        return;
      }

      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.isAnonymous) {
        return;
      }
      await this.$router.replace({ name: 'Home' });
    } finally {
      Loading.hide();
    }
  },
  computed: {
    ...mapState(useAuthStore, {
      dbUser: 'getDbUser',
    }),
  },
  methods: {
    ...mapActions(useAuthStore, {
      setFbUser: 'setFbUser',
      getTokenId: 'getTokenId',
      signin: 'signin',
    }),
    async continuteLogin(code: string, scope: string | undefined) {
      if (!scope || !scope.includes('photoslibrary.readonly')) {
        dialogExt.invalidAccess(
          "Grant 'View your Google Photos library' access for the application"
        );
        return;
      }

      try {
        const idToken = await this.getTokenId(code, getRedirectUrl());
        await this.firebaseSignin(idToken);
        await this.signin(idToken);
        await this.$router.replace({ name: 'Home' });
      } catch (error) {
        console.error(error);
        dialogExt.invalidAccess();
      }
    },
    async firebaseSignin(
      idToken: string,
      accessToken?: string
    ): Promise<UserCredential> {
      const credential = GoogleAuthProvider.credential(idToken, accessToken);

      if (auth.currentUser && auth.currentUser.isAnonymous) {
        try {
          const response = await linkWithCredential(
            auth.currentUser,
            credential
          );
          return response;
        } catch (error) {
          console.error(error);
          //throw error;
        }
      }

      const response = await signInWithCredential(auth, credential);
      return response;
    },
    async googleSignin() {
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

        await this.continuteLogin(response.code, response.scope);
      } finally {
        Loading.hide();
      }
    },
  },
});
</script>
<style lang="scss">
.login-page {
  background: #f0f2f5;
  &__btn {
    &__label {
      color: #fff;
      font-weight: 500;
      font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
      font-size: 18px;
      padding: 15px;
    }
    &__img {
      padding: 13px;
      background-color: #fff;
      margin: 1px 2px;
      border-radius: 3px;
    }
  }
  &__link {
    color: #1976d2;
    text-decoration: none;
    &:visited {
      color: #1976d2;
    }
    &:hover {
      text-decoration: underline;
    }
  }
  &__disclaimer {
    color: #757575;
    margin-top: 15px;
  }
}
</style>
