import React, { useEffect } from 'react'
import '../component-css/homePage.css'
import { Link } from 'react-router-dom'
import SEO from './SEO'

export default function HomePage() {
  useEffect(() => {
    document.title = "Dispersed"
  })
  const token = localStorage.getItem('token')
  return (
    <div className="home-page">
      <SEO 
        title="Dispersed - Find Your Perfect Dispersed Camping Site"
        description="Discover amazing dispersed camping locations in National Forests. Get real-time weather, create custom campsites, read reviews, and share your favorite spots."
      />
      <h1>Dispersed</h1>
      <div className='home-page-buttons'>
        <Link to='/map'>View Map</Link>
        {token
          ? <Link to='/campsites'>My Campsites</Link>
          : <Link to='/login'>Sign In</Link>
        }
      </div>
    </div>
  )
}
