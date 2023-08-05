import React, { useEffect, useState } from 'react'
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'

function PokemonCardImage({ src, alt, ...props }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
  }, [src]);

  if (!loaded) {
    return <Skeleton height={180} />;
  }

  return <img className='w-full border-b' src={src} alt={alt} {...props} />;
}

export default PokemonCardImage