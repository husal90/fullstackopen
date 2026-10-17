import { useState, useEffect } from 'react'
import weatherService, { hasApiKey } from '../services/weather'

const Weather = ({ city }) => {
  const [weather, setWeather] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!hasApiKey) return

    weatherService
      .getByCity(city)
      .then(data => {
        setWeather(data)
        setFailed(false)
      })
      .catch(() => setFailed(true))
  }, [city])

  if (!hasApiKey) {
    return <p>Weather unavailable: set VITE_WEATHER_KEY to show the weather.</p>
  }

  if (failed) {
    return <p>Could not load the weather for {city}.</p>
  }

  if (!weather) {
    return null
  }

  return (
    <div>
      <h3>Weather in {city}</h3>
      <div>temperature {weather.main.temp} Celsius</div>
      <img
        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
        alt={weather.weather[0].description}
      />
      <div>wind {weather.wind.speed} m/s</div>
    </div>
  )
}

export default Weather
