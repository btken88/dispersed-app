import React from 'react'
import MapContainer from './MapContainer'
import '../component-css/favorites.css'
import SiteInfo from './SiteInfo'
import Header from './Header'
import Footer from './Footer'

export default function Favorites({ favorites }) {

  const favoriteCards = favorites.map(favorite => {
    return <SiteInfo key={favorite.id} favorite={favorite} />
  })
  return (
    <div className="favorites">
      <Header />
      <ul className="favorites-list">
        {favoriteCards}
      </ul>
      <MapContainer />
      <Footer />
    </div>
  )
}
