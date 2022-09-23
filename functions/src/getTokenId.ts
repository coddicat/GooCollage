import * as functions from 'firebase-functions';
import { getFirestore, getSettings } from './ext';
import { OAuth2Client } from 'google-auth-library';
import { GetTokenResponse } from 'google-auth-library/build/src/auth/oauth2client';
import jwt_decode from 'jwt-decode';

async function getToken(clientId: string, clientSecret: string, redirectUri: string, code: string): Promise<GetTokenResponse> {
  const client = new OAuth2Client(clientId, clientSecret, redirectUri);
  const response = await client.getToken(code);
  return response;
}

export default functions.https.onCall(async (data: { code: string, redirectUri: string }): Promise<string> => {
  const redirectUri = data.redirectUri;
  const code = data.code;
  if (!redirectUri || !code) {
    throw 'One of the peroperties is missed';
  }

  const settings = await getSettings();
  const clientId = settings.client_id;
  const clientSecret = settings.client_secret;

  const response = await getToken(
    clientId,
    clientSecret,
    redirectUri,
    code
  );

  const idToken = response.tokens.id_token;
  if (!idToken) {
    throw 'failed to get token. id_token is empty';
  }

  const decoded = jwt_decode(idToken) as { sub: string | undefined, email: string, name: string };
  if (!decoded.sub) {
    throw 'Could not parse jwt';
  }

  const db = getFirestore();

  await db
    .collection('tokens')
    .doc(decoded.sub)
    .set(response.tokens, { merge: true });

  return idToken;
});
