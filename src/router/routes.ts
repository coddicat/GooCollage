import { NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import { useAlbumStore } from 'src/stores/album-store';
import { ADD_ALBUM_ID } from 'src/consts';
import redirectNoAlbum from './redirect-no-album';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    redirect: { name: 'Home' },
    component: () => import('layouts/MainLayout.vue'),
    children: [{
      name: 'Home',
      path: '/:albumId?',
      props: true,
      component: () => import('pages/AlbumPage.vue'),
      meta: {
        public: true,
      },
      beforeEnter: (to: RouteLocationNormalized, _, next: NavigationGuardNext) => {
        if (to.params.albumId) {
          next();
          return;
        }
        next(redirectNoAlbum());
      }
    }],
  },
  {
    path: '/about',
    component: () => import('layouts/EmptyLayout.vue'),
    meta: {
      public: true,
    },
    children: [{
      path: '',
      name: 'About',
      component: () => import('pages/AboutPage.vue'),
      meta: { public: true }
    }],
  },
  {
    path: '/login',
    component: () => import('layouts/EmptyLayout.vue'),
    meta: {
      public: true,
    },
    children: [{
      path: '',
      name: 'Login',
      component: () => import('pages/LoginPage.vue'),
      meta: { public: true }
    }],
  },
  {
    path: '/albums',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
      name: 'AlbumsBrowser',
      path: '',
      component: () => import('pages/AlbumsBrowserPage.vue'),
      beforeEnter:
        (_, __, next: NavigationGuardNext) => {
          const albumStore = useAlbumStore();
          albumStore.setAlbumId(ADD_ALBUM_ID);
          next();
        }
    }]
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
