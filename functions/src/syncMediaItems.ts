import * as functions from 'firebase-functions';
import { getAccessToken, getAlbum, getFirestore, getGoogleSecret } from './ext';
import axios from 'axios';
import { CallableContext } from 'firebase-functions/v1/https';
import * as admin from 'firebase-admin';

async function loadMediaItems(googleAlbumId: string, accessToken: string): Promise<{ mediaItems: { id: string, baseUrl: string }[] } | undefined> {
  const response = await axios.post(
    'https://photoslibrary.googleapis.com/v1/mediaItems:search',
    {
      pageSize: 50,
      albumId: googleAlbumId,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data as { mediaItems: { id: string, baseUrl: string }[] } | undefined;
}

export default functions.https.onCall(async (data: { albumId: string }, context: CallableContext) => {
  const album = await getAlbum(data.albumId);
  const googleSecret = await getGoogleSecret(data.albumId);
  if (!album || !googleSecret) {
    throw 'An album does not exist';
  }

  const uid = context?.auth?.uid;
  const owner = album.uid == uid;
  const db = getFirestore();
  const cacheRef = db.collection('cache').doc(data.albumId);

  await db.runTransaction(async (transaction) => {
    const cacheDoc = await transaction.get(cacheRef);

    if (cacheDoc.exists && !owner) {
      const expiry = cacheDoc.data().expiry as admin.firestore.Timestamp;
      const valid = (expiry.toDate().getTime() - new Date().getTime()) / 1000 > 5;
      if (valid) {
        functions.logger.warn("SyncMediaItems has been rejected as it's not expired");
        return;
      }
    }

    const accessToken = await getAccessToken(album.uid);
    if (!accessToken) {
      throw 'Could not get access token';
    }

    const googleAlbumId = googleSecret.albumId;
    const mediaItemsResponse = await loadMediaItems(googleAlbumId, accessToken);

    // const imgResponse = await axios.get(`${mediaItemsResponse.mediaItems[0].baseUrl}=w${50}-h${50}`, { responseType: 'arraybuffer' });
    // const imgData = imgResponse.data;
    // return `data:${imgResponse.headers['content-type']};base64,${Buffer.from(imgData, 'binary').toString('base64')}`;

    const items: { baseUrl: string, id: string }[] = mediaItemsResponse?.mediaItems?.map((x: { id: string, baseUrl: string }) =>
      ({ baseUrl: x.baseUrl, id: x.id })) ?? [];

    const expiryDate = new Date(Date.now() + 50 * 60000);
    await transaction
      .set(cacheRef, {
        items: items,
        expiry: admin.firestore.Timestamp.fromDate(expiryDate),
        uid: album.uid
      });
  });
});
