// Default endpoints for stream discovery
export const DEFAULT_ENDPOINTS = {
  primary: [
    'https://yts.mx/api/v2/movie_details.json?imdb_id={id}',
    'https://yts.mx/api/v2/list_movies.json?query_term={id}'
  ],
  secondary: [
    'https://api.themoviedb.org/3/movie/{id}/external_ids',
    'https://api.themoviedb.org/3/tv/{id}/external_ids'
  ],
  fallback: [
    'https://torrentio.strem.fun/stream/movie/{id}.json',
    'https://torrentio.strem.fun/stream/series/{id}.json'
  ]
};

// Default trackers for magnet links
export const DEFAULT_TRACKERS = [
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://open.tracker.cl:1337/announce',
  'udp://9.rarbg.com:2810/announce',
  'udp://tracker.torrent.eu.org:451/announce',
  'udp://tracker.dler.org:6969/announce',
  'udp://open.stealth.si:80/announce',
  'udp://exodus.desync.com:6969/announce',
  'udp://tracker.openbittorrent.com:6969/announce',
  'http://tracker.openbittorrent.com:80/announce',
  'udp://www.torrent.eu.org:451/announce',
  'udp://tracker.moeking.me:6969/announce',
  'udp://movies.zsw.ca:6969/announce',
  'udp://uploads.gamecoast.net:6969/announce',
  'udp://tracker.tiny-vps.com:6969/announce',
  'udp://tracker.theoks.net:6969/announce',
  'udp://tracker.skyts.net:6969/announce',
  'udp://tracker.publictracker.xyz:6969/announce',
  'udp://tracker.monitorit4.me:6969/announce'
];
