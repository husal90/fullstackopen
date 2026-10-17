import Weather from './Weather'

const Country = ({ country }) => {
  const capital = country.capital?.[0]

  return (
    <div>
      <h2>{country.name.common}</h2>
      <div>Capital {capital}</div>
      <div>Area {country.area}</div>

      <h3>Languages</h3>
      <ul>
        {Object.values(country.languages ?? {}).map(language => (
          <li key={language}>{language}</li>
        ))}
      </ul>

      <img
        src={country.flags.png}
        alt={country.flags.alt ?? `Flag of ${country.name.common}`}
        width="150"
      />

      {capital && <Weather city={capital} />}
    </div>
  )
}

export default Country
