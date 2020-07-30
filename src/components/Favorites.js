import React, { useState, useEffect } from 'react'
import MapContainer from './MapContainer'
import '../component-css/favorites.css'
import SiteInfo from './SiteInfo'
import Header from './Header'
import Footer from './Footer'

export default function Favorites() {
  const [settings, setSettings] = useState({
    center: [-105.6598, 39.821],
    zoom: 11
  })
  const [favorites, setFavorites] = useState([])

  const token = localStorage.getItem('token')

  useEffect(() => {
    fetch('http://localhost:5000/favorites', {
      headers: { 'Authorization': localStorage.getItem('token') }
    }).then(response => response.json())
      .then(setFavorites)
  }, [])

  function favoriteCards() {
    return favorites.map(favorite => {
      return <SiteInfo
        key={favorite.id}
        favorite={favorite}
        setSettings={setSettings} />
    })
  }


  return (
    <div className="favorites">
      <Header />
      {token
        ? <>
          <ul className="favorites-list">
            {favoriteCards()}
          </ul>
          <MapContainer
            points={favorites}
            center={settings.center}
            zoom={settings.zoom} />
        </>
        : <h2>You must be logged in to see this page.</h2>
      }
      <Footer />
    </div>
  )
}
