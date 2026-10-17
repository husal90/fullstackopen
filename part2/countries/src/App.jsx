import { useState, useEffect } from 'react'
import countryService from './services/countries'
import Countries from './components/Countries'

const App = () => {
  const [countries, setCountries] = useState([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    countryService
      .getAll()
      .then(allCountries => setCountries(allCountries))
  }, [])

  const matches = filter
    ? countries.filter(country =>
        country.name.common.toLowerCase().includes(filter.toLowerCase())
      )
    : []

  return (
    <div>
      <div>
        find countries{' '}
        <input value={filter} onChange={(event) => setFilter(event.target.value)} />
      </div>
      <Countries countries={matches} onShow={setFilter} />
    </div>
  )
}

export default App
