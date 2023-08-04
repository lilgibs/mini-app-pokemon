export function getTypeColor(type) {
  switch (type) {
    case 'fire':
      return 'bg-red-500'
    case 'water':
      return 'bg-blue-500'
    case 'grass':
      return 'bg-green-500'
    case 'electric':
      return 'bg-yellow-500'
    case 'poison':
      return 'bg-purple-600'
    case 'ice':
      return 'bg-cyan-400'
    case 'psychic':
      return 'bg-pink-600'
    case 'bug':
      return 'bg-lime-600'
    case 'fairy':
      return 'bg-pink-400'
    case 'flying':
      return 'bg-indigo-400'
    default:
      return 'bg-gray-500'
  }
}