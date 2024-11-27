import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { BellIcon, ChevronDownIcon, SearchIcon, XIcon } from 'lucide-react'

function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'TV Shows', href: '/tv-shows' },
    { name: 'Movies', href: '/movies' },
    { name: 'New & Popular', href: '/new' },
    { name: 'My List', href: '/my-list' }
  ]

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`)
      setShowSearch(false)
      setSearchTerm('')
    }
  }

  return (
    <header
      className={`${isScrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent'
        } fixed top-0 z-50 w-full transition-colors duration-300`}
    >
      <div className="flex w-full items-center justify-between h-[35px] px-4 md:px-8">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* <img
            src="/src/assets/react.svg"
            alt="Netflix"
            className="h-5 w-20 cursor-pointer object-contain md:h-7 md:w-24"
            onClick={() => navigate('/')}
          /> */}

          <p className='text-2xl font-semibold cursor-pointer hover:text-white'>MovieZone</p>

          {/* Desktop Navigation */}
          <>
            <nav className="hidden lg:flex space-x-4">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`headerLink group relative ${location.pathname === item.href
                    ? 'font-semibold text-white'
                    : 'text-[#e5e5e5] hover:text-white'
                    }`}
                >
                  {item.name}
                  {location.pathname === item.href && (
                    <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-red-600" />
                  )}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-red-600 transition-all duration-200 group-hover:w-full" />
                </button>
              ))}
            </nav>

            {/* Mobile Navigation */}
            <div className="relative lg:hidden">
              <button
                className="flex items-center space-x-2 text-sm font-medium text-white"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <span>Browse</span>
                <ChevronDownIcon className={`w-4 h-4 transition duration-200 ${showMobileMenu ? 'rotate-180' : 'rotate-0'}`} />
              </button>

              {showMobileMenu && (
                <div className="absolute top-8 left-0 bg-black/90 border border-gray-700 p-2 w-56 rounded animate-fade-in">
                  <div className="flex flex-col space-y-3">
                    {navigation.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          navigate(item.href)
                          setShowMobileMenu(false)
                        }}
                        className={`mobileLink ${location.pathname === item.href && 'text-white font-semibold'
                          }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4 text-sm">
          <>
            <button
              className="h-6 w-6 cursor-pointer transition hover:text-[#b3b3b3]"
              onClick={() => setShowSearch(true)}
            >
              <SearchIcon className="h-6 w-6" />
            </button>
            <BellIcon className="h-6 w-6 cursor-pointer transition hover:text-[#b3b3b3]" />
          </>
        </div>
      </div>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative w-full max-w-2xl bg-[#141414] p-6">
            <button
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
              onClick={() => {
                setShowSearch(false)
                setSearchTerm('')
              }}
            >
              <XIcon className="h-6 w-6" />
            </button>
            <form onSubmit={handleSearch} className="mt-4">
              <div className="flex items-center border-b-2 border-gray-600 focus-within:border-white">
                <SearchIcon className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Titles, people, genres"
                  className="w-full bg-transparent px-4 py-2 text-white placeholder-gray-400 focus:outline-none"
                  autoFocus
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
