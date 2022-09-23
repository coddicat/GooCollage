import { route } from 'quasar/wrappers';
import {
  //createMemoryHistory,
  createRouter,
  //createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'stores/auth-store';
import { getCurrentUser } from '../firebase';
import {
  getAuth/*, signInAnonymously,*/
} from 'firebase/auth';
import { Loading } from 'quasar';
import { useAlbumStore } from 'src/stores/album-store';

export default route(function () {
  // const createHistory = process.env.SERVER
  //   ? createMemoryHistory
  //   : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createWebHistory()
    // history: createHistory(
    //   process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE
    // ),
  });

  Router.beforeEach(async (to, _, next) => {
    try {
      Loading.show({
        backgroundColor: 'blue-grey-10',
        message: 'Hang on...',
        messageColor: 'white'
      });

      const authStore = useAuthStore();
      const currentUser = await getCurrentUser();
      if (authStore.getFbUser != currentUser) {
        await authStore.setFbUser(currentUser ?? undefined);
      }

      if (authStore.getFbUser && !authStore.getFbUser.isAnonymous && !authStore.getDbUser) {
        const auth = getAuth();

        const store = useAlbumStore();
        store.clearData();
        store.destroy();

        await auth.signOut();
        await authStore.setFbUser(undefined);
        next({ path: '/login' });
        return;
      }

      const authRequired = !to.meta.public;

      if (authRequired && !authStore.fbUser) {
        //auth.returnUrl = to.fullPath;
        next({ path: '/login' });
      }/* else if (!authStore.fbUser) {
        const auth = getAuth();
        const response = await signInAnonymously(auth);
        console.log(response);
      }*/

      next();
    } finally {
      Loading.hide();
    }
  });

  return Router;
});
