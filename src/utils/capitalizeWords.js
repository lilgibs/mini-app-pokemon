export function capitalizeWords(string) {
  return string
    .split(' ') // memecah string menjadi kata-kata
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // mengubah huruf pertama setiap kata menjadi kapital
    .join(' ') // menggabungkan kata-kata kembali menjadi string
}