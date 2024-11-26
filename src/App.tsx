import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Movies from './pages/Movies'
import TVShows from './pages/TVShows'
import MyList from './pages/MyList'
import Search from './pages/Search'
import New from './pages/New'
import Info from './pages/Info'
import useAuth from './hooks/useAuth'

function App() {
  const { user } = useAuth()

  return (
    <div className="relative h-screen bg-[#141414]">
      {user && <Header />}
      <main className="relative">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Home />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/movies"
            element={
              user ? (
                <Movies />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/tv-shows"
            element={
              user ? (
                <TVShows />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/my-list"
            element={
              user ? (
                <MyList />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/search"
            element={
              user ? (
                <Search />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/new"
            element={
              user ? (
                <New />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/info/:type/:id"
            element={
              user ? (
                <Info />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/login"
            element={
              !user ? (
                <Login />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
