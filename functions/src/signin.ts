import * as functions from 'firebase-functions';
import jwt_decode from 'jwt-decode';
import { DbUser } from './types';
import { getFirestore, setSubCache } from './ext';
import { CallableContext } from 'firebase-functions/v1/https';

export default functions.https.onCall(async (data: { idToken: string }, context: CallableContext): Promise<void> => {
  if (!context.auth || !context.auth.uid) {
    throw 'Request is not authenticated';
  }
  const uid = context.auth.uid;

  const idToken = data.idToken;
  if (!idToken) {
    throw "parameter idToken isn't specified";
  }

  const decoded = jwt_decode(idToken) as { sub: string | undefined, email: string, name: string };
  if (!decoded.sub) {
    throw 'Could not parse jwt';
  }

  const sub = decoded.sub;
  setSubCache(uid, sub);

  const user: DbUser = {
    sub: sub,
    revoked: false,
  }

  const db = getFirestore();

  await db
    .collection('users')
    .doc(uid)
    .set(user, { merge: true });
});
