import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Movies from './pages/Movies'
import TVShows from './pages/TVShows'
import MyList from './pages/MyList'
import Search from './pages/Search'
import New from './pages/New'
import Info from './pages/Info'
import VideoModal from './components/common/VideoModal'
import { VideoModalProvider, useVideoModal } from './context/VideoModalContext'

function AppContent() {
  const { isOpen, embedUrl, closeModal } = useVideoModal();

  return (
    <div className="relative h-screen bg-[#141414]">
      <Header />
      <VideoModal isOpen={isOpen} onClose={closeModal} embedUrl={embedUrl} />
      <main className="relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/tv" element={<TVShows />} />
          <Route path="/my-list" element={<MyList />} />
          <Route path="/search" element={<Search />} />
          <Route path="/new" element={<New />} />
          <Route path="/info/:type/:id" element={<Info />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <VideoModalProvider>
      <AppContent />
    </VideoModalProvider>
  )
}

export default App
