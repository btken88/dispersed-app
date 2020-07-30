import React from 'react'
import '../component-css/homePage.css'
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="home-page">
      <h1>Dispersed</h1>
      <div className='home-page-buttons'>
        <Link to='/map'>View Map</Link>
        <Link to='/login'>Sign In</Link>
      </div>
    </div>
  )
}
