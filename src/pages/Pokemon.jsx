import axios from 'axios'
import React, { useEffect, useState } from 'react'
import PokemonCard from '../components/PokemonCard'
import Pagination from '../components/Pagination'
import Banner from '../components/Banner'
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'
import PokemonSearchBar from '../components/PokemonSearchBar';

function Pokemon() {
  const [pokemonDatas, setPokemonDatas] = useState()
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const [totalPokemon, setTotalPokemon] = useState(null);
  const [filterValue, setFilterValue] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const totalPages = Math.ceil(totalPokemon / limit);

  function handlePageClick({ selected: selectedPage }) {
    setPage(selectedPage + 1);
  }

  const fetchPokemons = async (page, limit, filterValue) => {
    try {
      setIsLoading(true)
      if (filterValue) {
        const valueLowerCase = filterValue.toLowerCase().replace(/\s+/g, '-');

        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${valueLowerCase}`)
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
      if (error.response && error.response.status === 404) {
        alert("Pokemon not found");
      } else {
        alert("An error occurred");
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
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
          <PokemonSearchBar onSearch={handleSearch} filterValue={filterValue} setFilterValue={setFilterValue} />
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4'>
          {isLoading ? (
            Array.from({ length: limit }).map((_, index) => (
              <div key={index} className="w-full border rounded p-2 bg-white">
                <Skeleton height={180} />
                <Skeleton height={20} />
                <Skeleton height={20} />
                <Skeleton height={20} />
              </div>
            ))
          ) : (
            pokemonDatas && pokemonDatas.map((pokemon) => <PokemonCard key={pokemon.name} pokemon={pokemon} />)
          )}
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