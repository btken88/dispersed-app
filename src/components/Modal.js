import React, { useEffect, useState } from 'react'
import InfoCard from './InfoCard'
import FavoriteForm from './FavoriteForm'
import api from '../services/api'
import '../component-css/Modal.css'

export default function Modal({ point, setPoint, favorites, setFavorites, props }) {
  const [weather, setWeather] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  function handleClick() {
    setPoint({})
  }

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getWeather(point.lat, point.lng);
        setWeather(data);
      } catch (err) {
        console.error('Failed to fetch weather:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (point.lat && point.lng) {
      fetchWeather();
    }
  }, [point.lat, point.lng])


  return (
    <div onClick={handleClick} className="modal">
      {showForm
        ? <FavoriteForm
          setShowForm={setShowForm}
          showForm={showForm}
          point={point}
          favorites={favorites}
          setFavorites={setFavorites}
          props={props} />
        : <InfoCard weather={weather} point={point} setShowForm={setShowForm} showForm={showForm} />}
    </div >
  )
}
