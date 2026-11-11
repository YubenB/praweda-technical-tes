export type RandomUser = {
  name: { title: string; first: string; last: string }
  location: {
    street: { number: number; name: string }
    city: string
    state: string
    country: string
  }
  email: string
  dob: { age: number }
  registered: { age: number }
  phone: string
  cell: string
  picture: { large: string; medium: string; thumbnail: string }
}

export const toUser = (u: RandomUser) => {
  const loc = u.location
  return {
    name: `${u.name.title}, ${u.name.first} ${u.name.last}`,
    location: `${loc.street.number}, ${loc.street.name}, ${loc.city}, ${loc.state}, ${loc.country}`,
    email: u.email,
    // in soal age = 21 itu registered.age, the real age sih dob.age
    age: u.registered.age,
    phone: u.phone,
    cell: u.cell,
    picture: [u.picture.large, u.picture.medium, u.picture.thumbnail],
  }
}
