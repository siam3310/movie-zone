import { useEffect, useState } from 'react'
import { Movie } from '../types/movie'
import { baseUrl } from '../constants/movie'
import { FaPlus } from "react-icons/fa";

function MyList() {
  const [myList, setMyList] = useState<Movie[]>([])

  useEffect(() => {
    document.title = 'My List - MovieZone'
    // Load saved movies from localStorage
    const savedList = localStorage.getItem('netflix-mylist')
    if (savedList) {
      setMyList(JSON.parse(savedList))
    }
  }, [])

  const removeFromList = (movieId: number) => {
    const updatedList = myList.filter((item) => item.id !== movieId)
    setMyList(updatedList)
    localStorage.setItem('netflix-mylist', JSON.stringify(updatedList))
  }

  if (myList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#141414] text-white px-4">
        <div className="max-w-md w-full text-center space-y-6 py-16">
          {/* Empty List Icon */}
          <div className="mx-auto w-24 h-24 rounded-full bg-[#2f2f2f] flex items-center justify-center mb-8">
            <FaPlus className="w-12 h-12 text-[#686868]" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold">
            Your list is empty
          </h1>

          {/* Description */}
          <p className="text-lg text-[#686868]">
            Add shows and movies that you want to watch later by clicking the + button.
          </p>

          {/* Browse Button */}
          <button 
            className="mt-8 bg-white text-black py-3 px-6 rounded-md font-semibold hover:bg-[#e6e6e6] transition duration-200"
            onClick={() => window.location.href = '/'}
          >
            Browse Content
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold mb-8">My List</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {myList.map((item) => (
          <div key={item.id} className="relative h-48 cursor-pointer md:h-64 group">
            <img
              src={`${baseUrl}${item.backdrop_path || item.poster_path}`}
              alt={item.title || item.name}
              className="rounded-sm object-cover transition duration-200 ease-out group-hover:scale-105 h-full w-full"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <h2 className="text-sm font-semibold md:text-lg">
                {item.title || item.name}
              </h2>
            </div>
            <button
              onClick={() => removeFromList(item.id)}
              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyList
