import React, { useState } from 'react'
import MapContainer from './MapContainer'
import '../component-css/favorites.css'
import SiteInfo from './SiteInfo'
import Header from './Header'
import Footer from './Footer'

export default function Favorites({ favorites }) {
  const [settings, setSettings] = useState({
    center: [-105.6598, 39.821],
    zoom: 11
  })

  const favoriteCards = favorites.map(favorite => {
    return <SiteInfo
      key={favorite.id}
      favorite={favorite}
      setSettings={setSettings} />
  })
  return (
    <div className="favorites">
      <Header />
      <ul className="favorites-list">
        {favoriteCards}
      </ul>
      <MapContainer
        points={favorites}
        center={settings.center}
        zoom={settings.zoom} />
      <Footer />
    </div>
  )
}
