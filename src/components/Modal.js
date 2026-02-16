import React, { useEffect, useState } from 'react'
import InfoCard from './InfoCard'
import FavoriteForm from './FavoriteForm'
import CampsiteForm from './CampsiteForm'
import api from '../services/api'
import '../component-css/Modal.css'

export default function Modal({ point, setPoint, favorites, setFavorites, props }) {
  const [weather, setWeather] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [showCampsiteForm, setShowCampsiteForm] = useState(false)

  function handleClick() {
    setPoint({})
  }

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await api.getWeather(point.lat, point.lng);
        setWeather(data);
      } catch (err) {
        console.error('Failed to fetch weather:', err);
      }
    };

    if (point.lat && point.lng) {
      fetchWeather();
    }
  }, [point.lat, point.lng])

  function handleCampsiteSaved() {
    setShowCampsiteForm(false);
    setPoint({});
  }

  return (
    <div onClick={handleClick} className="modal">
      {showCampsiteForm ? (
        <div onClick={(e) => e.stopPropagation()}>
          <CampsiteForm 
            initialData={{ 
              latitude: point.lat, 
              longitude: point.lng 
            }}
            onSave={handleCampsiteSaved}
            onClose={() => setShowCampsiteForm(false)}
          />
        </div>
      ) : showForm
        ? <FavoriteForm
          setShowForm={setShowForm}
          showForm={showForm}
          point={point}
          favorites={favorites}
          setFavorites={setFavorites}
          props={props} />
        : <InfoCard 
          weather={weather} 
          point={point} 
          setShowForm={setShowForm} 
          showForm={showForm}
          setShowCampsiteForm={setShowCampsiteForm}
        />}
    </div >
  )
}
