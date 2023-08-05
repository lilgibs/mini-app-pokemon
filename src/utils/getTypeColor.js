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
    case 'ground':
      return 'bg-yellow-900'
    case 'rock':
      return 'bg-yellow-700'
    case 'fairy':
      return 'bg-pink-400'
    case 'bug':
      return 'bg-lime-600'
    case 'ghost':
      return 'bg-indigo-800'
    case 'steel':
      return 'bg-gray-500'
    case 'flying':
      return 'bg-indigo-400'
    case 'normal':
      return 'bg-emerald-800'
    case 'fighting':
      return 'bg-amber-900'
    case 'psychic':
      return 'bg-pink-600'
    case 'ice':
      return 'bg-cyan-400'
    case 'dragon':
      return 'bg-purple-700'
    case 'dark':
      return 'bg-gray-900'
    default:
      return 'bg-gray-500'
  }
}
