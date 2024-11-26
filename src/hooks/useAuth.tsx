import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

interface IAuth {
  user: User | null
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
  loading: boolean
}

interface User {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
}

const AuthContext = createContext<IAuth>({
  user: null,
  signUp: async () => {},
  signIn: async () => {},
  logout: async () => {},
  error: null,
  loading: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const navigate = useNavigate()

  // Persisting the user
  useEffect(() => {
    const userData = localStorage.getItem('netflix_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    setInitialLoading(false)
  }, [])

  const signUp = async (email: string, password: string) => {
    setLoading(true)

    try {
      // Simulate API call
      const newUser = {
        uid: Math.random().toString(36).substr(2, 9),
        email,
        displayName: email.split('@')[0],
      }
      
      localStorage.setItem('netflix_user', JSON.stringify(newUser))
      setUser(newUser)
      navigate('/')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)

    try {
      // Simulate API call
      const user = {
        uid: Math.random().toString(36).substr(2, 9),
        email,
        displayName: email.split('@')[0],
      }
      
      localStorage.setItem('netflix_user', JSON.stringify(user))
      setUser(user)
      navigate('/')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)

    try {
      localStorage.removeItem('netflix_user')
      setUser(null)
      navigate('/login')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const memoedValue = useMemo(
    () => ({
      user,
      signUp,
      signIn,
      logout,
      loading,
      error,
    }),
    [user, loading, error]
  )

  return (
    <AuthContext.Provider value={memoedValue}>
      {!initialLoading && children}
    </AuthContext.Provider>
  )
}

export default function useAuth() {
  return useContext(AuthContext)
}
