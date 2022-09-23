import * as functions from 'firebase-functions';
import { CallableContext } from 'firebase-functions/v1/https';
import { getAccessToken } from './ext';
import axios from 'axios';
import { GoogleAlbumInfo } from './types';

async function loadAlbums(accessToken: string, nextPageToken: string): Promise<{ nextPageToken: string, albums: GoogleAlbumInfo[] | undefined } | undefined> {
  const response = await axios.get(
    'https://photoslibrary.googleapis.com/v1/albums',
    {
      params: {
        pageSize: 10,
        pageToken: nextPageToken,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data as { nextPageToken: string, albums: GoogleAlbumInfo[] | undefined } | undefined;
}

export default functions.https.onCall(async (data: { nextPageToken: string }, context: CallableContext) => {
  if (!context.auth || !context.auth.uid) {
    throw 'Request is not authenticated';
  }

  const uid = context.auth.uid;
  const accessToken = await getAccessToken(uid);
  if (!accessToken) {
    throw 'Could not get access token';
  }

  const response = await loadAlbums(accessToken, data.nextPageToken);
  const albums = response?.albums?.map((x: GoogleAlbumInfo) => ({
    coverPhotoBaseUrl: x.coverPhotoBaseUrl,
    id: x.id,
    title: x.title,
    mediaItemsCount: x.mediaItemsCount
  })) ?? [];

  return {
    albums,
    nextPageToken: response?.nextPageToken
  }
});
