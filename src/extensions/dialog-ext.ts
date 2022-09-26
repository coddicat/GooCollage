import { Dialog } from 'quasar';
import { useAuthStore } from '../stores/auth-store';
import browseAlbumHtml from '!!raw-loader!./browse-albums-notify.html';
import publicAlbumHtml from '!!raw-loader!./public-album-notify.html';

function inform(key: string, title: string | undefined, message: string, html?: boolean, cancel?: boolean): Promise<boolean> {
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
      title,
      message,
      html,
      options: {
        type: 'checkbox',
        model: [],
        items: [
          { label: "Don't notify next time", value: 'cancelNotify' },
        ],
      },
      cancel: cancel ?? true,
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
      .onCancel(() => resolve(false));
  });
}

function confirm(title: string, message: string): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    Dialog.create({
      dark: true,
      message,
      title,
      cancel: true,
      focus: 'cancel'
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false));
  });
}

export type PromptResult = {
  ok: boolean,
  data: string
}

function prompt(title: string, message: string, value: string): Promise<PromptResult> {
  return new Promise<PromptResult>(resolve => {
    Dialog.create({
      dark: true,
      title,
      message,
      prompt: {
        model: value,
      },
      cancel: true,
    })
      .onOk((data: string) => resolve({
        ok: true,
        data
      }))
      .onCancel(() => resolve({ ok: false, data: '' }));
  });
}

export default {
  publicAlbum(): Promise<boolean> {
    return inform(
      'public_cancelNotify',
      undefined,
      publicAlbumHtml,
      true
    );
  },
  browseAlbum(): Promise<boolean> {
    return inform(
      'browse_album_cancelNotify',
      undefined,//'Make the album public, are you sure?',
      browseAlbumHtml,
      true,
      false,
    );
  },
  invalidAccess(message?: string): void {
    Dialog.create({
      dark: true,
      title: 'Invalid access',
      message: message ?? 'Something wrong, try again',
    });
  },
  revokeAccess(): Promise<boolean> {
    return confirm('Are you sure?', 'Revoke google access');
  },
  deleteAccount(): Promise<boolean> {
    return confirm('Are you sure?', 'All data will be lost forever. Delete this account and all relative data?');
  },
  deleteAlbum(albumName: string): Promise<boolean> {
    return confirm('Are you sure?', `Deletion '${albumName}' album`);
  },
  renameAlbum(albumName: string): Promise<PromptResult> {
    return prompt('Rename album name', "Enter the album's display name:", albumName);
  },
  removeAlbumFromList(albumName: string): Promise<boolean> {
    return confirm('Are you sure?', `Removing '${albumName}' album`);
  },
  signOut(): Promise<boolean> {
    return confirm('Are you sure?', 'Signing out');
  },
  obtainMediaItemsFailed(): void {
    Dialog.create({
      title: 'Media items obtaining has been failed',
      dark: true,
      message:
        'Some media items from the album could not be downloaded, needed to Sync with Google Album',
    });
  },
  // syncMediaItemsFailed(owner: boolean): void {
  //   Dialog.create({
  //     dark: true,
  //     message:
  //       owner
  //         ? 'Sync media items with Google album has been failed. Try to authorize a new GOOGLE access.'
  //         : 'Sync media items with Google album has been failed. Contact with the Album\'s owner.'
  //   });
  // }
}
