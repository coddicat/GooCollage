import googleConfig from './config.env.json';

const googleScript = document.createElement('script');
googleScript.setAttribute('src', 'https://accounts.google.com/gsi/client');

let callbackResolver: (response: { code: string | undefined, scope: string | undefined }) => void;

export const getRedirectUrl = () => `${location.origin}/login`;

const codeClientPromise = new Promise<google.accounts.oauth2.CodeClient>(
  (resolve) => {
    googleScript.onload = () => {
      const codeClient = google.accounts.oauth2.initCodeClient({
        client_id: googleConfig.clientId,
        scope: googleConfig.scope,
        callback: (response: unknown) => {
          callbackResolver(response as { code: string | undefined, scope: string | undefined });
        },
        ux_mode: 'redirect',
        redirect_uri: getRedirectUrl(),
      });
      resolve(codeClient);
    };
  }
);
document.head.appendChild(googleScript);

const googleApp = {
  async signin(): Promise<{ code: string | undefined, scope: string | undefined }> {
    const codeClient = await codeClientPromise;
    const callbackPromise = new Promise<{ code: string | undefined, scope: string | undefined }>((resolve) => {
      callbackResolver = resolve;
    });
    codeClient?.requestCode();
    return callbackPromise;
  }
}

export default googleApp;
