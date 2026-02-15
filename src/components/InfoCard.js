import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function InfoCard({ weather, point, setShowForm, showForm }) {
  const [elevation, setElevation] = useState(null)
  const { current, daily } = weather
  const { lat, lng } = point

  useEffect(() => {
    const fetchElevation = async () => {
      try {
        const data = await api.getElevation(lat, lng);
        setElevation(data.elevation);
      } catch (error) {
        console.error('Failed to fetch elevation:', error);
        setElevation(null);
      }
    };
    
    fetchElevation();
  }, [lat, lng])

  const loggedIn = localStorage.getItem('token')


  let fiveDayForecast = null
  if (daily) {
    fiveDayForecast = daily.slice(0, 5).map(day => {
      return (
        <div className='day' key={day.sunrise}>
          <img src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
            alt={day.weather[0].main} />
          <p>{day.weather[0].main}</p>
          <p>High: {Math.floor(day.temp.max)}</p>
          <p>Low: {Math.floor(day.temp.min)}</p>
        </div>
      )
    })
  }

  function showFavoriteForm(event) {
    event.stopPropagation()
    setShowForm(!showForm)
  }

  return (
    <div className='modal-card'>
      <h2>Current Weather</h2>
      {weather.current ?
        (<>
          <p>Elevation: {elevation} ft.</p>
          <p>Lat: {point.lat.toFixed(4)}</p>
          <p>Lon: {point.lng.toFixed(4)}</p>
          <img src={`http://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
            alt={current.weather[0].main} />
          <p>{current.weather[0].description}</p>
          <br></br>
          <p>Current Temp: {Math.floor(current.temp)}</p>
          <p>Feels like: {Math.floor(current.feels_like)}</p>
          <p>Humidity: {Math.floor(current.humidity)}%</p>
          <br></br>
          <h2>Five Day Forecast</h2>
          <div className='five-day-forecast'>
            {fiveDayForecast}
          </div>
        </>)
        : null}
      <div className='card-buttons'>
        <a href={`https://www.google.com/maps/dir/''/${lat},${lng}`} target="blank">Get there with Google</a>
        {loggedIn ? <button onClick={showFavoriteForm}>Add to Favorites</button> : null}
      </div>
    </div>
  )
}