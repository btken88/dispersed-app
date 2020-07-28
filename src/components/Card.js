import React from 'react'


export default function Card({ weather }) {
  const { current, daily } = weather

  let fiveDayForecast = null
  if (daily) {
    fiveDayForecast = daily.slice(0, 5).map(day => {
      return (
        <div className='day' >
          <img src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
            alt={day.weather[0].main} />
          <p>{day.weather[0].main}</p>
          <p>High: {day.temp.max}</p>
          <p>Low: {day.temp.min}</p>
        </div>
      )
    })
  }

  return (
    <div className='modal-card'>
      {weather.current ?
        (<>
          <h2>Current Weather</h2>
          <img src={`http://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
            alt={current.weather[0].main} />
          <p>{current.weather[0].description}</p>
          <br></br>
          <p>Current Temp: {current.temp}</p>
          <p>Feels like: {current.feels_like}</p>
          <p>Humidity: {current.humidity}%</p>
          <br></br>
          <h2>Five Day Forecast</h2>
          <div className='five-day-forecast'>
            {fiveDayForecast}
          </div>
        </>)
        : null}
    </div>
  )
}