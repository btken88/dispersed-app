import React from 'react'
import '../component-css/homePage.css'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const token = localStorage.getItem('token')
  return (
    <div className="home-page">
      <h1>Dispersed</h1>
      <div className='home-page-buttons'>
        <Link to='/map'>View Map</Link>
        {token
          ? <Link to='/favorites'>Favorites</Link>
          : <Link to='/login'>Sign In</Link>
        }
      </div>
    </div>
  )
}
