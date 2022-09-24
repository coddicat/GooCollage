import { Loading, QSpinnerGrid } from 'quasar';
import { AlbumState } from './album-store-state-type';

export default async function cacheImages(state: AlbumState): Promise<boolean> {
  const promises = [] as Promise<boolean>[];
  for (let i = 0; i < state.items.length; i++) {
    const item = state.items[i];
    if (!!state.cache[item.id]) {
      continue;
    }
    const img = new Image();
    img.loading = 'eager';

    const promise = new Promise<boolean>(
      (resolve) => {
        img.src = item.baseUrl;
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.setAttribute('style', 'height: 100%; width: 100%; object-fit: cover;');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            state.cache[item.id] = canvas;
            resolve(true);
          } catch (error) {
            resolve(false);
          }
        }
        img.onerror = () => {
          resolve(false);
        }
      }
    );

    promises.push(promise);
  }

  let res = false;
  try {
    Loading.show({
      message: 'Caching media items',
      spinner: QSpinnerGrid,
      spinnerColor: 'green',
    });
    console.log('start cache');
    const result = await Promise.all(promises);
    if (result.length == 0 || result.filter(x => x).length > result.filter(x => !x).length) {
      res = true;
    }
  } catch (error) {
    console.error(error);
    res = false;
  } finally {
    console.log('finish cache');
    Loading.hide();
  }
  return res;
}
