import { Dialog } from 'quasar';
import { useAuthStore } from './stores/auth-store';

function notify(key: string, title: string, message: string): Promise<boolean> {
  const authStore = useAuthStore();
  const uid = authStore.getFbUser?.uid;
  return new Promise(resolve => {
    const cancelNotify = localStorage.getItem(
      `${uid}_${key}`
    );
    if (cancelNotify === 'cancelNotify') {
      resolve(true);
      return;
    }

    Dialog.create({
      dark: true,
      title,
      message,
      options: {
        type: 'checkbox',
        model: [],
        items: [
          { label: "Don't notify next time", value: 'cancelNotify' },
        ],
      },
      cancel: true,
    })
      .onOk((data) => {
        if (data && data.length > 0 && data[0] == 'cancelNotify') {
          localStorage.setItem(
            `${uid}_${key}`,
            'cancelNotify'
          );
        }
        resolve(true);
      })
      .onCancel(() => {
        resolve(false);
      });
  });
}

export default {
  publicAlbum() {
    return notify('public_cancelNotify', 'Make the album public, are you sure?', 'Attention, it is possible to automatically add unwanted photos to the public album, this Google\'s feature is called "Live Albums" with the ability of Google Photos to automatically detect people and pets in photos and automatically add any photo of a person, several people or pets to the album.')
  }
}
