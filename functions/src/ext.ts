import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { AppSettings, DbUser, GoogleSecret, Public } from './types';
import { Credentials, OAuth2Client } from 'google-auth-library';
import { Album } from './types';

let firestore: admin.firestore.Firestore;
let settings: AppSettings;
const subCache: { [uid: string]: string } = {};

async function obtainAccessToken(sub: string, tokens: Credentials): Promise<string | undefined | null> {
  if (!tokens.expiry_date || !tokens.refresh_token) {
    return undefined;
  }

  const expiryDate = new Date(tokens.expiry_date);
  const valid = (expiryDate.getTime() - new Date().getTime()) / 1000 > 5;
  if (valid) {
    return tokens.access_token;
  }

  const settings = await getSettings();
  const clientId = settings.client_id;
  const clientSecret = settings.client_secret;

  const client = new OAuth2Client(clientId, clientSecret);
  client.credentials = {
    refresh_token: tokens.refresh_token
  }
  const response = await client.refreshAccessToken();
  const accessToken = response.credentials.access_token;
  const newExpiryDate = response.credentials.expiry_date;

  const db = getFirestore();

  await db
    .collection('tokens')
    .doc(sub)
    .update({
      access_token: accessToken,
      expiry_date: newExpiryDate,
    });

  return accessToken;
}

async function getUserSub(uid: string): Promise<string | undefined> {
  const cache = subCache[uid];
  if (!!cache) {
    return cache;
  }
  const user = await getUser(uid);
  if (!user) {
    return undefined;
  }
  subCache[uid] = user.sub;
  return user.sub;
}

export async function getTokens(sub: string): Promise<Credentials | undefined> {
  const db = getFirestore();
  const snapshot = await db
    .collection('tokens')
    .doc(sub)
    .get();

  return snapshot.data() as Credentials | undefined;
}

export async function getUser(uid: string): Promise<DbUser | undefined> {
  const db = getFirestore();
  const snapshot = await db
    .collection('users')
    .doc(uid)
    .get();

  return snapshot.data() as DbUser | undefined;
}

export function setSubCache(uid: string, sub: string): void {
  subCache[uid] = sub;
}

export function getFirestore(): admin.firestore.Firestore {
  if (!!firestore) {
    return firestore;
  }
  admin.initializeApp(functions.config().firebase);
  firestore = admin.firestore();
  return firestore;
};

export async function getSettings(): Promise<AppSettings> {
  if (!!settings) {
    return settings;
  }

  const db = getFirestore();
  const snapshot = await db
    .collection('settings')
    .doc('secrets')
    .get();

  return snapshot.data() as AppSettings;
}

export async function getAccessToken(uid: string): Promise<string | undefined> {
  const sub = await getUserSub(uid);
  if (!sub) {
    throw 'User sub does not exist';
  }

  const tokens = await getTokens(sub);
  if (!tokens) {
    throw 'sub does not exist';
  }

  const accessToken = await obtainAccessToken(sub, tokens);
  if (!accessToken) {
    throw 'Could not obtain access token';
  }

  return accessToken;
}

export async function getAlbum(albumId: string): Promise<Album | undefined> {
  const db = getFirestore();
  const snapshot = await db
    .collection('albums')
    .doc(albumId)
    .get();

  return snapshot.data() as Album | undefined;
}

export async function getGoogleSecret(albumId: string): Promise<GoogleSecret | undefined> {
  const db = getFirestore();
  const snapshot = await db
    .collection(`albums/${albumId}/secrets`)
    .doc('google')
    .get();

  return snapshot.data() as GoogleSecret | undefined;
}

export async function getPublic(albumId: string): Promise<Public | undefined> {
  const db = getFirestore();
  const snapshot = await db
    .collection('public')
    .doc(albumId)
    .get();

  return snapshot.data() as Public | undefined;
}

export async function getAlbumSecret(albumId: string): Promise<{ value: string } | undefined> {
  const db = getFirestore();
  const snapshot = await db
    .collection(`albums/${albumId}/secrets`)
    .doc('password')
    .get();

  return snapshot.data() as { value: string } | undefined;
}

