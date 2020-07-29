import React, { useEffect, useState } from 'react'


export default function InfoCard({ weather, point, setShowForm, showForm }) {
  const [elevation, setElevation] = useState(null)
  const { current, daily } = weather
  const { lat, lng } = point

  const elevationAPI = `http://open.mapquestapi.com/elevation/v1/profile?unit=f&key=${process.env.REACT_APP_MAPQUEST_API_KEY}&latLngCollection=${lat},${lng}`

  useEffect(() => {
    fetch(elevationAPI)
      .then(response => response.json())
      .then(data => {
        let elevationResult = Math.floor(data.elevationProfile[0].height)
        setElevation(elevationResult)
      })
  }, [elevationAPI])


  let fiveDayForecast = null
  if (daily) {
    fiveDayForecast = daily.slice(0, 5).map(day => {
      return (
        <div className='day' key={day.sunrise}>
          <img src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
            alt={day.weather[0].main} />
          <p>{day.weather[0].main}</p>
          <p>High: {day.temp.max.toFixed(1)}</p>
          <p>Low: {day.temp.min.toFixed(1)}</p>
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
          <p>Lng: {point.lng.toFixed(4)}</p>
          <img src={`http://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
            alt={current.weather[0].main} />
          <p>{current.weather[0].description}</p>
          <br></br>
          <p>Current Temp: {current.temp.toFixed(1)}</p>
          <p>Feels like: {current.feels_like.toFixed(1)}</p>
          <p>Humidity: {current.humidity.toFixed(1)}%</p>
          <br></br>
          <h2>Five Day Forecast</h2>
          <div className='five-day-forecast'>
            {fiveDayForecast}
          </div>
        </>)
        : null}
      <div className='card-buttons'>
        <a href={`https://www.google.com/maps/dir/''/${lat},${lng}`} target="blank">Get there with Google</a>
        <button onClick={showFavoriteForm}>Add to Favorites</button>
      </div>
    </div>
  )
}