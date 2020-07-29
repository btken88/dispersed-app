import React, { useEffect, useState } from 'react'
import Card from './Card'
import '../component-css/Modal.css'

const exclusions = 'minutely,hourly'

export default function Modal({ point, setPoint }) {
  const weatherAPI = `https://api.openweathermap.org/data/2.5/onecall?lat=${point.lat}&lon=${point.lng}&exclude=${exclusions}&units=imperial&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`
  const [weather, setWeather] = useState({})


  function handleClick() {
    setPoint({})
  }

  useEffect(() => {
    fetch(weatherAPI)
      .then(response => response.json())
      .then(result => setWeather(result))
  }, [weatherAPI])


  return (
    <div onClick={handleClick} className="modal">
      <Card weather={weather} point={point} />
    </div >
  )
}
