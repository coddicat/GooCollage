import { Notify } from 'quasar';

export default {
  albumDeleted(): void {
    Notify.create({
      message: 'The album has been deleted',
      timeout: 2000,
      position: 'top',
      type: 'positive'
    });
  },
  albumRenamed(): void {
    Notify.create({
      message: 'The album has been renamed',
      timeout: 2000,
      position: 'top',
      type: 'positive'
    });
  },
  albumAdded(): void {
    Notify.create({
      message: 'The album has been added to your list',
      timeout: 2000,
      position: 'top',
      type: 'positive'
    });
  },
  albumRemoved(): void {
    Notify.create({
      message: 'The album has been removed from your list',
      timeout: 2000,
      position: 'top',
      type: 'positive'
    });
  },
  linkCopied(): void {
    Notify.create({
      message: "The album's link has been copied.",
      timeout: 2000,
      position: 'top',
      type: 'positive'
    });
  }
}
