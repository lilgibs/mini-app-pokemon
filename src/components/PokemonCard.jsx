import React from 'react'
import { capitalizeWords } from '../utils/capitalizeWords'
import { getTypeColor } from '../utils/getTypeColor'
import { Link } from 'react-router-dom'

function PokemonCard({ pokemon }) {
  return (
    <div className='group flex flex-col border rounded-md shadow-sm hover:border-yellow-500 cursor-pointer hover:-translate-y-1 duration-200'>
      <Link to={`/pokemon/${pokemon.id}`}>
        <img
          src={pokemon.sprites?.other["official-artwork"].front_default || pokemon.sprites?.other["official-artwork"].front_shiny || 'pokeball2.png'} alt={pokemon.name}
          className='w-full bg-neutral-50 border-b rounded-t-md' />

        <div className='p-2 flex flex-col justify-between bg-white rounded-b-md h-28 md:h-32'>
          <div className=''>
            <p className='text-neutral-500 text-xs md:text-sm'>#{String(pokemon.id).padStart(4, '0')}</p>
            <p className='font-semibold text-md md:text-lg'>{capitalizeWords(pokemon.name)}</p>
          </div>
          <div className='flex gap-2 text-xs font-bold justify-end'>
            {pokemon.types.map(pokemon => (
              <p className={`py-1 px-2  rounded  text-white ` + getTypeColor(pokemon.type.name)}>
                {capitalizeWords(pokemon.type.name)}
              </p>
            ))}
          </div>
        </div>
      </Link>
    </div>
  )
}

export default PokemonCard