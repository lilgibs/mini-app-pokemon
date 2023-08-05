import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { FaSearch } from 'react-icons/fa';
import PokemonCard from '../components/PokemonCard'
import Pagination from '../components/Pagination'
import Banner from '../components/Banner'

function Pokemon() {
  const [pokemonDatas, setPokemonDatas] = useState()
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const [totalPokemon, setTotalPokemon] = useState(null);
  const [filterValue, setFilterValue] = useState(null)

  const totalPages = Math.ceil(totalPokemon / limit);

  function handlePageClick({ selected: selectedPage }) {
    setPage(selectedPage + 1);
  }

  const fetchPokemons = async (page, limit, filterValue) => {
    try {
      if (filterValue) {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${filterValue}`)
        console.log(response)
        setPokemonDatas([response.data]);
      } else {
        const offset = (page - 1) * limit;
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)
        const pokemons = response.data.results
        setTotalPokemon(response.data.count);

        const pokemonDetails = await Promise.all(pokemons.map(async (pokemon) => {
          try {
            const pokemonResponse = await axios.get(pokemon.url)
            return pokemonResponse.data
          } catch (error) {
            return null;
          }
        }))
        const validPokemonDetails = pokemonDetails.filter(pokemon => pokemon !== null);
        setPokemonDatas(validPokemonDetails);
      }
    } catch (error) {
      alert(error.response.data)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchPokemons(page, limit, filterValue)
  }

  useEffect(() => {
    fetchPokemons(page, limit)
  }, [page, limit])

  return (
    <div className='min-h-screen'>
      <Banner />
      <div className='w-[90%] max-w-5xl mx-auto mt-5'>
        <div className='flex-grow'>
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
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5'>
          {pokemonDatas && pokemonDatas.map(pokemon => (
            <PokemonCard pokemon={pokemon} />
          ))}
        </div>
        <div className='mt-5'>
          <Pagination
            pageCount={totalPages}
            onPageChange={handlePageClick}
            forcePage={page - 1}
          />
        </div>
      </div>
    </div>
  )
}

export default Pokemon