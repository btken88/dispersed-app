import React, { useEffect, useState } from 'react'
import InfoCard from './InfoCard'
import FavoriteForm from './FavoriteForm'
import '../component-css/Modal.css'

const exclusions = 'minutely,hourly'

export default function Modal({ point, setPoint, favorites, setFavorites }) {
  const weatherAPI = `https://api.openweathermap.org/data/2.5/onecall?lat=${point.lat}&lon=${point.lng}&exclude=${exclusions}&units=imperial&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`
  const [weather, setWeather] = useState({})
  const [showForm, setShowForm] = useState(false)


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
      {showForm
        ? <FavoriteForm setShowForm={setShowForm} showForm={showForm} point={point} favorites={favorites} setFavorites={setFavorites} />
        : <InfoCard weather={weather} point={point} setShowForm={setShowForm} showForm={showForm} />}
    </div >
  )
}
