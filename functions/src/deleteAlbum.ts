import * as functions from 'firebase-functions';
import { CallableContext } from 'firebase-functions/v1/https';
import { getAlbum, getFirestore } from './ext';
export default functions.https.onCall(async (data: { albumId: string }, context: CallableContext) => {
  if (!context.auth || !context.auth.uid) {
    throw 'Request is not authenticated';
  }
  const albumId = data.albumId;
  if (!albumId || albumId.trim() == '') {
    throw "parameter albumId isn't specified";
  }
  const uid = context.auth.uid;
  const album = await getAlbum(albumId)
  if (!album) {
    return;
  }
  if (album.uid != uid) {
    throw 'access denied';
  }
  const db = getFirestore();
  const albumRef = db.collection('albums').doc(albumId);
  const publicRef = db.collection('public').doc(albumId);
  const cacheRef = db.collection('cache').doc(albumId);
  const userAlbumRef = db.collection(`users/${uid}/albums`).doc(albumId);

  const publicDoc = await publicRef.get();
  const cacheDoc = await cacheRef.get();
  const userAlbumDoc = await userAlbumRef.get();

  const secretsCollRef = db.collection(`albums/${albumId}/secrets`);
  const accessesCollRef = db.collection(`public/${albumId}/accesses`);

  const accesses = await accessesCollRef.listDocuments();
  const secrets = await secretsCollRef.listDocuments();

  const batch = db.batch();
  accesses.forEach(access => batch.delete(access));
  secrets.forEach(secret => batch.delete(secret));

  if (publicDoc.exists) {
    batch.delete(publicRef);
  }
  if (cacheDoc.exists) {
    batch.delete(cacheRef);
  }
  if (userAlbumDoc.exists) {
    batch.delete(userAlbumRef);
  }

  batch.delete(albumRef);

  await batch.commit();
});
