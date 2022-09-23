import * as functions from 'firebase-functions';
import { getAlbumSecret, getFirestore, getPublic } from './ext';
import { CallableContext } from 'firebase-functions/v1/https';
import * as admin from 'firebase-admin';

export default functions.https.onCall(async (data: { albumId: string, password: string, version: string }, context: CallableContext): Promise<boolean> => {
  if (!context.auth || !context.auth.uid) {
    throw 'Request is not authenticated';
  }
  const uid = context.auth.uid;

  const albumId = data.albumId;
  if (!albumId || albumId.trim() == '') {
    throw "parameter albumId isn't specified";
  }

  const version = data.version;
  if (!version || version.trim() == '') {
    throw "parameter version isn't specified";
  }

  const shared = await getPublic(albumId);
  if (!shared) {
    throw 'The public album does not exist';
  }

  if (shared.version != version) {
    functions.logger.warn('wrong version');
    return false;
  }

  const albumSecret = await getAlbumSecret(albumId);
  if (!albumSecret || albumSecret.value.trim() == '') {
    throw "The album doesn't have secret password";
  }

  if (albumSecret.value != data.password) {
    return false;
  }

  const db = getFirestore();
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 1);
  functions.logger.info('expiryDate:', expiryDate);
  await db
    .collection(`public/${albumId}/accesses`)
    .doc(uid)
    .set({
      expiry: admin.firestore.Timestamp.fromDate(expiryDate),
      version: version
    });

  return true;
});
