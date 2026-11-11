import { test } from 'node:test'
import assert from 'node:assert/strict'
import { colors, items, labels, combine } from './arr'

test('5 colors (soal case 1)', () => {
  assert.deepEqual(combine(colors, items, labels), [
    'Baju Merah Diskon',
    'Celana Hijau Sale',
    'Topi Kuning Diskon',
    'Jaket Ungu Sale',
    'Sepatu Pink Sale',
  ])
})

test('+ maroon (soal case 2): ga ada pair, stay di index 5', () => {
  assert.deepEqual(combine([...colors, 'maroon'], items, labels), [
    'Baju Merah Diskon',
    'Celana Hijau Sale',
    'Topi Kuning Diskon',
    'Jaket Ungu Sale',
    'Sepatu Pink Sale',
    'Baju Maroon Diskon',
  ])
})

test('7 colors: maroon <-> navy swap juga, item & label muter lagi', () => {
  assert.deepEqual(combine([...colors, 'maroon', 'navy'], items, labels), [
    'Baju Merah Diskon',
    'Celana Hijau Sale',
    'Topi Kuning Diskon',
    'Jaket Ungu Sale',
    'Sepatu Pink Sale',
    'Baju Navy Diskon',
    'Celana Maroon Sale',
  ])
})
