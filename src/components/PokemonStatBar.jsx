import React from 'react'

function PokemonStatBar({ statName, statValue }) {
  const normalizedStatValue = Math.min(100, (statValue / 200) * 100);

  return (
    <div className='flex flex-col sm:flex-row items-center w-full mb-2'>
      <div className='sm:w-1/4 font-semibold text-md lg:text-xl text-neutral-400'>
        {statName}
      </div>
      <div className='w-full sm:w-3/4 flex flex-row items-center'>
        <div className='bg-gray-200 h-4 w-full'>
          <div style={{ width: `${normalizedStatValue}%` }} className='bg-green-300 h-full' />
        </div>
        <p className='text-md lg:text-lg w-[10%] text-right'>{statValue}</p>
      </div>
    </div>
  )
}

export default PokemonStatBar