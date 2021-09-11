import React, { useState, useEffect } from 'react'
import MapContainer from './MapContainer'
import '../component-css/favorites.css'
import FavoriteSiteInfo from './FavoriteSiteInfo'
import Header from './Header'
import Footer from './Footer'

const backend = 'https://dispersed-api.herokuapp.com/favorites'
export default function Favorites() {
  const [settings, setSettings] = useState({
    center: [-105.6598, 39.821],
    zoom: 9
  })
  const [favorites, setFavorites] = useState([])

  const token = localStorage.getItem('token')

  useEffect(() => {
    document.title = "Dispersed - Favorites";
    fetch(backend, {
      headers: { 'Authorization': localStorage.getItem('token') }
    }).then(response => response.json())
      .then(setFavorites)
  }, []);

  function favoriteCards() {
    return favorites.map(favorite => {
      return <FavoriteSiteInfo
        key={favorite._id}
        favorite={favorite}
        setSettings={setSettings}
        favorites={favorites}
        setFavorites={setFavorites} />
    })
  }


  return (
    <div className="favorites">
      <Header />
      {token
        ? <>
          <ul className="favorites-list">
            {favorites.length ? favoriteCards() : <li><p style={{ textAlign: 'center' }}>You don't have any favorites yet. Visit the Map page to add some!</p></li>}
          </ul>
          <MapContainer
            points={favorites}
            center={settings.center}
            zoom={settings.zoom} />
        </>
        : <h2 className='favorite-warning'>You must be logged in to see this page.</h2>
      }
      <Footer />
    </div>
  )
}
