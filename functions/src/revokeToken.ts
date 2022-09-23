import * as functions from 'firebase-functions';
import { getFirestore, getSettings, getTokens, getUser } from './ext';
import { Credentials, OAuth2Client } from 'google-auth-library';
import { CallableContext } from 'firebase-functions/v1/https';

async function revokeToken(clientId: string, clientSecret: string, tokens: Credentials): Promise<void> {
  const client = new OAuth2Client(clientId, clientSecret);
  client.credentials = {
    refresh_token: tokens.refresh_token,
    access_token: tokens.access_token
  }
  await client.revokeCredentials();
}

export default functions.https.onCall(async (_, context: CallableContext): Promise<void> => {
  if (!context.auth || !context.auth.uid) {
    throw 'Request is not authenticated';
  }
  const uid = context.auth.uid;
  const settings = await getSettings();
  const clientId = settings.client_id;
  const clientSecret = settings.client_secret;

  const db = getFirestore();

  const user = await getUser(uid);
  if (!user) {
    throw 'User does not exist';
  }

  const tokens = await getTokens(user.sub);
  if (!tokens) {
    throw 'Tokens do not exist';
  }

  await revokeToken(
    clientId,
    clientSecret,
    tokens
  );

  await db
    .collection('users')
    .doc(uid)
    .set({ revoked: true }, { merge: true });
});
