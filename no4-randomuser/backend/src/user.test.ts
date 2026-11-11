import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toUser } from './user'

// sample object persis dari soal
const emma = {
  gender: 'female',
  name: { title: 'Ms', first: 'Emma', last: 'Hakola' },
  location: {
    street: { number: 9208, name: 'Nordenskiöldinkatu' },
    city: 'Lieksa',
    state: 'Åland',
    country: 'Finland',
    postcode: 88501,
    coordinates: { latitude: '-24.1862', longitude: '9.6559' },
    timezone: { offset: '+8:00', description: 'Beijing, Perth, Singapore, Hong Kong' },
  },
  email: 'emma.hakola@example.com',
  login: {
    uuid: '31bde77f-dd98-47a1-9559-8ba0ecba3d22',
    username: 'orangelion758',
    password: 'erin',
    salt: 'YKGBQggw',
    md5: '57178c4df0a0228e602a14107c476384',
    sha1: 'be7928ad974578dd0ff53504783f9e4fc1039a57',
    sha256: '88db3a168c9c2a8788c9e1ff97a629270162e9fed0f3fc97af284c73fcc2e494',
  },
  dob: { date: '1982-12-28T23:42:08.870Z', age: 40 },
  registered: { date: '2002-05-30T01:34:24.155Z', age: 21 },
  phone: '08-761-811',
  cell: '048-075-31-27',
  id: { name: 'HETU', value: 'NaNNA656undefined' },
  picture: {
    large: 'https://randomuser.me/api/portraits/women/86.jpg',
    medium: 'https://randomuser.me/api/portraits/med/women/86.jpg',
    thumbnail: 'https://randomuser.me/api/portraits/thumb/women/86.jpg',
  },
  nat: 'FI',
}

test('toUser: sample from soal jadi expected output', () => {
  assert.deepEqual(toUser(emma), {
    name: 'Ms, Emma Hakola',
    location: '9208, Nordenskiöldinkatu, Lieksa, Åland, Finland',
    email: 'emma.hakola@example.com',
    age: 21,
    phone: '08-761-811',
    cell: '048-075-31-27',
    picture: [
      'https://randomuser.me/api/portraits/women/86.jpg',
      'https://randomuser.me/api/portraits/med/women/86.jpg',
      'https://randomuser.me/api/portraits/thumb/women/86.jpg',
    ],
  })
})
