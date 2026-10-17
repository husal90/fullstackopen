import axios from 'axios'

const baseUrl = 'https://api.openweathermap.org/data/2.5/weather'
const apiKey = import.meta.env.VITE_WEATHER_KEY

export const hasApiKey = Boolean(apiKey)

const getByCity = (city) => {
  const request = axios.get(baseUrl, {
    params: { q: city, units: 'metric', appid: apiKey },
  })
  return request.then(response => response.data)
}

export default { getByCity }
