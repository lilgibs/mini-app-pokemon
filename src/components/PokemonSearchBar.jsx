import React from 'react'
import { FaSearch } from 'react-icons/fa';

function PokemonSearchBar({ onSearch, filterValue, setFilterValue }) {
  const handleSearch = (e) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <form onSubmit={handleSearch}>
      <div className="flex justify-between w-full text-sm md:text-md mb-3 md:mb-5">
        <input
          className='border-l border-b border-t rounded-s-md px-4 focus:border-yellow-400 focus:outline-none w-full'
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          placeholder="Search by pokemon name ..."
        />
        <button
          className="flex gap-2 items-center bg-yellow-400 hover:bg-yellow-500 font-semibold text-white text-md py-2 md:py-3 px-4 rounded-e-md cursor-pointer"
          type='submit'
        >
          <FaSearch />
          <p>Search</p>
        </button>
      </div>
    </form>
  )
}

export default PokemonSearchBar