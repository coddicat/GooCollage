import * as functions from 'firebase-functions';
import { CallableContext } from 'firebase-functions/v1/https';
import { getFirestore, getSettings } from './ext';
import * as admin from 'firebase-admin';
import { Credentials, OAuth2Client } from 'google-auth-library';

async function revokeToken(clientId: string, clientSecret: string, tokens: Credentials): Promise<void> {
  const client = new OAuth2Client(clientId, clientSecret);
  client.credentials = {
    refresh_token: tokens.refresh_token,
    access_token: tokens.access_token
  }
  await client.revokeCredentials();
}

export default functions.https.onCall(async (_, context: CallableContext) => {
  if (!context.auth || !context.auth.uid) {
    throw 'Request is not authenticated';
  }

  const uid = context.auth.uid;

  const db = getFirestore();
  const userRef = await db.collection('users').doc(uid);
  const userDoc = await userRef.get();
  const sub = userDoc.data().sub;
  const tokenRef = await db.collection('tokens').doc(sub);
  const token = await tokenRef.get();
  const settings = await getSettings();
  const clientId = settings.client_id;
  const clientSecret = settings.client_secret;

  const batch = db.batch();

  const albumQuery = await db.collection('albums').where('uid', '==', uid).get();
  const publicQuery = await db.collection('public').where('uid', '==', uid).get();
  const cacheQuery = await db.collection('cache').where('uid', '==', uid).get();

  const albumDocs = await albumQuery.docs;
  albumDocs.forEach(async album => {
    const albumId = album.id;
    const secretsCollRef = db.collection(`albums/${albumId}/secrets`);
    const secrets = await secretsCollRef.listDocuments();
    secrets.forEach(secret => batch.delete(secret));
    batch.delete(album.ref);
  });

  const publicDocs = await publicQuery.docs;
  publicDocs.forEach(async p => {
    const albumId = p.id;
    const accessesCollRef = db.collection(`public/${albumId}/accesses`);
    const accesses = await accessesCollRef.listDocuments();
    accesses.forEach(access => batch.delete(access));
    batch.delete(p.ref);
  });

  const cacheDocs = await cacheQuery.docs;
  cacheDocs.forEach(cache => {
    batch.delete(cache.ref);
  });

  const userAlbums = await db.collection(`users/${uid}/albums`).listDocuments();
  userAlbums.forEach(userAlbum => batch.delete(userAlbum));

  batch.delete(userRef);
  if (token.exists) {
    batch.delete(tokenRef);
  }

  await batch.commit();

  if (token.exists) {
    await revokeToken(clientId, clientSecret, token.data());
  }
  await admin.auth().deleteUser(uid);
});
