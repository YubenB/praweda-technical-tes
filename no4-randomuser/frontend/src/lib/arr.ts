export const colors = ['merah', 'kuning', 'hijau', 'pink', 'ungu']
export const items = ['baju', 'celana', 'topi', 'jaket', 'sepatu']
export const labels = ['Diskon', 'Sale', 'Diskon', 'Sale', 'Sale']

const title = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

// color order in soal: 0, 2, 1, 4, 3, 5 -> index 0 stays, the rest swap per pair (1-2, 3-4, ...)
// kalo pair nya ga ada (maroon at index 5) ya stay di tempat
// item & label follow the index, muter lagi dari awal kalo colors nya lebih banyak
export function combine(colors: string[], items: string[], labels: string[]) {
  if (!items.length || !labels.length) return []
  return colors.map((_, i) => {
    let j = i === 0 ? 0 : i % 2 === 1 ? i + 1 : i - 1
    if (j >= colors.length) j = i
    return [items[i % items.length], colors[j], labels[i % labels.length]].map(title).join(' ')
  })
}
