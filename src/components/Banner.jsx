import React from 'react'

function Banner() {
  return (
    <div className='flex gap-2 justify-center items-center h-24 sm:h-32 w-full bg-neutral-700 text-yellow-300 shadow-md'>
      <img src="pokeball.png" className='h-1/3' alt="" />
      <p className='text-3xl sm:text-4xl font-bold'>Pokemon List</p>
    </div>
  )
}

export default Banner