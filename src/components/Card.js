import React from 'react'


export default function Card({ weather }) {
  console.log(weather)
  const { current, daily } = weather
    ;
  return (
    <div className='modal-card'>
      {weather.current ?
        (<>
          <img src={`http://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
            alt={current.weather[0].main} />
          <p>Current Temperature: {current.temp}</p>
          <p>Humidity: {current.humidity}</p>
          <p>Feels like: {current.feels_like}</p>
        </>)
        : null}
    </div>
  )
}