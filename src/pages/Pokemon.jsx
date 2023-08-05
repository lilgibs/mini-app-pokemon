import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { capitalizeWords } from '../utils/capitalizeWords'
import PokemonCard from '../components/PokemonCard'
import Pagination from '../components/Pagination'
import Banner from '../components/Banner'

function Pokemon() {
  const [pokemonDatas, setPokemonDatas] = useState()
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const [totalPokemon, setTotalPokemon] = useState(null);

  const totalPages = Math.ceil(totalPokemon / limit);

  function handlePageClick({ selected: selectedPage }) {
    setPage(selectedPage + 1);
  }

  const fetchPokemons = async (page, limit) => {
    try {
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
      console.log(pokemonDetails)
    } catch (error) {
      console.log(error)
    }
  }


  useEffect(() => {
    fetchPokemons(page, limit)
  }, [page, limit])

  return (
    <>
      <Banner />
      <div className='w-[90%] max-w-5xl mx-auto mt-5'>
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
    </>
  )
}

export default Pokemon