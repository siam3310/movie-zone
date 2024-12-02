import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Movies from './pages/Movies'
import TVShows from './pages/TVShows'
import MyList from './pages/MyList'
import Search from './pages/Search'
import New from './pages/New'
import Info from './pages/View'
import { initializeMediaProcessors } from './utils/media/index';
import { DEFAULT_ENDPOINTS, DEFAULT_TRACKERS } from './utils/media/endpoints';

// Initialize media processors
initializeMediaProcessors({
  tmdbApiKey: import.meta.env.VITE_TMDB_API_KEY,
  userAgent: 'MovieZone/1.0',
  primaryEndpoints: DEFAULT_ENDPOINTS.primary,
  secondaryEndpoints: DEFAULT_ENDPOINTS.secondary,
  fallbackEndpoints: DEFAULT_ENDPOINTS.fallback,
  trackers: DEFAULT_TRACKERS
});

function App() {
  return (
    <div className="relative h-screen bg-[#141414]">
      <Header />
      <main className="relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/tv-shows" element={<TVShows />} />
          <Route path="/my-list" element={<MyList />} />
          <Route path="/search" element={<Search />} />
          <Route path="/new" element={<New />} />
          <Route path="/info/:type/:id" element={<Info />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
