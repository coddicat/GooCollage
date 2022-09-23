import { Loading, QSpinnerGrid } from 'quasar';
import { AlbumState } from './album-store-state-type';

export default async function cacheImages(state: AlbumState) {
  const promises = [] as Promise<void>[];
  for (let i = 0; i < state.items.length; i++) {
    const item = state.items[i];
    if (!!state.cache[item.id]) {
      continue;
    }
    const img = new Image();
    img.loading = 'eager';

    const promise = new Promise<void>(
      (resolve) => {
        img.src = item.baseUrl;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.setAttribute('style', 'height: 100%; width: 100%; object-fit: cover;');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          state.cache[item.id] = canvas;
          resolve();
        }
        img.onerror = () => {
          resolve();
        }
      }
    );

    promises.push(promise);
  }

  try {
    Loading.show({
      message: 'Caching media items',
      spinner: QSpinnerGrid,
      spinnerColor: 'green',
    });
    console.log('start cache');
    await Promise.all(promises);
  } catch (error) {
    console.error(error);
  } finally {
    console.log('finish cache');
    Loading.hide();
  }
}
