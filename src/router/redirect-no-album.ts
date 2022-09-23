import { useAuthStore } from 'src/stores/auth-store';

function redirectNoAlbum(): object | string {
  const store = useAuthStore();
  const albums = store.getAlbumList.slice();
  albums.sort(
    (x, y) => (x.created?.nanoseconds ?? 0) - (y.created?.nanoseconds ?? 0)
  );
  const albumId = albums.length > 0 ? albums[0].id : undefined

  if (albumId) {
    return ({
      name: 'Home',
      params: { albumId },
    });
  } else {
    return ('/albums');
  }
}

export default redirectNoAlbum;
