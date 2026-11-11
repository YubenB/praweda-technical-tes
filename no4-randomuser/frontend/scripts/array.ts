import { colors, items, labels, combine } from '../src/lib/arr'

console.log('5 colors:')
console.log(combine(colors, items, labels))

console.log('6 colors (+ maroon):')
console.log(combine([...colors, 'maroon'], items, labels))
