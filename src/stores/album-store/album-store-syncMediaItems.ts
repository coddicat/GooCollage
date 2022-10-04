import { ADD_ALBUM_ID } from 'src/consts';
import firebaseApp from '../../firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Loading, QSpinnerGrid } from 'quasar';

const functions = getFunctions(firebaseApp);
const syncMediaItems = httpsCallable(functions, 'syncMediaItems');

export default async function (albumId: string | undefined): Promise<void> {
  if (!albumId || albumId === ADD_ALBUM_ID) {
    return;
  }
  try {
    console.log('syncmedia start');

    Loading.show({
      message: 'Sync media items.',
      spinner: QSpinnerGrid,
      spinnerColor: 'yellow',
    });
    await syncMediaItems({ albumId });
  } catch (error) {
    throw error;
  } finally {
    Loading.hide();
    console.log('syncmedia end');
  }
}
