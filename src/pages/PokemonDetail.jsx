import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { capitalizeWords } from '../utils/capitalizeWords'
import Banner from '../components/Banner'
import { getStatName } from '../utils/statNameMapping'
import PokemonStatBar from '../components/PokemonStatBar'
import { getTypeColor } from '../utils/getTypeColor'
import { spaceWords } from '../utils/spaceWords'

function PokemonDetail() {
  const [pokemon, setPokemon] = useState(null);
  const { id } = useParams();

  const fetchPokemon = async () => {
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}/`);
      setPokemon(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPokemon();
  }, []);

  if (!pokemon) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Banner pageName='Pokemon Detail' />
      <div className='w-[90%] max-w-4xl min-h-screen bg-white mx-auto text-neutral-700 p-5 border rounded mt-5'>
        <div className='flex flex-col md:-flex-row gap-5'>
          <div className='flex flex-col sm:flex-row w-full gap-5 h-auto'>
            <div className='flex sm:w-1/3 bg-neutral-50 rounded border items-center'>
              <img
                src={pokemon.sprites?.other["official-artwork"].front_default || pokemon.sprites?.other["official-artwork"].front_shiny || '/pokeball2.png'}
                alt={pokemon.name}
              />
            </div>
            <div className='flex flex-col gap-5 md:w-2/3'>
              <div className='flex flex-row justify-between text-3xl md:text-4xl lg:text-5xl'>
                <p className='font-bold '>{spaceWords(pokemon.name)}</p>
                <p className=' text-neutral-400'>#{String(id).padStart(4, '0')}</p>
              </div>
              <div className='flex flex-col'>
                <p className='font-bold text-xl lg:text-2xl border-b mb-2'>Information</p>
                <div className='flex flex-col gap-y-4 text-md lg:text-xl text-neutral-600'>
                  <div className='flex'>
                    <p className='font-semibold text-neutral-400 w-1/5'>Height</p>
                    <p className=''>{pokemon.height / 10} Meter</p>
                  </div>
                  <div className='flex'>
                    <p className='font-semibold text-neutral-400 w-1/5'>Ability</p>
                    <div className='flex flex-wrap gap-1 '>
                      {pokemon.abilities?.map((ability, index) => (
                        <p className=' bg-neutral-700 text-white rounded px-2' key={index}>{spaceWords(ability.ability.name)}</p>
                      ))}
                    </div>
                  </div>
                  <div className='flex'>
                    <p className='font-semibold text-neutral-400 w-1/5'>Species</p>
                    <p>{capitalizeWords(pokemon.species.name)}</p>
                  </div>
                  <div className='flex'>
                    <p className='font-semibold text-neutral-400 w-1/5'>Type</p>
                    <div className='flex gap-1'>
                      {pokemon.types.map(pokemon => (
                        <p className={`px-2  rounded  text-white ` + getTypeColor(pokemon.type.name)}>
                          {capitalizeWords(pokemon.type.name)}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className=''>
            <p className='font-bold text-xl lg:text-2xl border-b mb-2'>Base Stat</p>
            {pokemon.stats.map((stat, index) => (
              <PokemonStatBar key={index} statName={getStatName(stat.stat.name)} statValue={stat.base_stat} />
            ))}
          </div>
          <Link to="/">
            <p className='px-2 py-1 w-fit mx-auto lg:text-lg outline outline-1 bg-neutral-50 hover:outline-none border-yellow-500 font-semibold rounded hover:bg-neutral-700 hover:text-yellow-300 cursor-pointer duration-150'>
              Browse All Pokemon
            </p>
          </Link>
        </div>
      </div>
    </>
  );
}

export default PokemonDetail;
