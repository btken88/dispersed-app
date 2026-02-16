import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const { isAuthenticated, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleLogOut() {
    try {
      await logout()
      setMobileMenuOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  function toggleMobileMenu() {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false)
  }

  return (
    <header id='header'>
      <h1><Link to='/' onClick={closeMobileMenu}>Dispersed</Link></h1>
      
      {/* Hamburger Menu Button */}
      <button 
        className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
        onClick={toggleMobileMenu}
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul className={`navigation ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <li><NavLink to='/about' onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'active-link' : ''}>About</NavLink></li>
        <li><NavLink to='/map' onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'active-link' : ''}>Map</NavLink></li>
        <li><NavLink to='/search' onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'active-link' : ''}>Search</NavLink></li>
        {isAuthenticated
          ? (
            <>
              <li><NavLink to='/campsites' onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'active-link' : ''}>My Campsites</NavLink></li>
              <li><NavLink to='/profile' onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'active-link' : ''}>My Profile</NavLink></li>
              <li><NavLink to='/' onClick={handleLogOut}>Log Out</NavLink></li>
            </>)
          : <li><NavLink to='/login' onClick={closeMobileMenu} className={({ isActive }) => isActive ? 'active-link' : ''}>Log In</NavLink></li>
        }
      </ul>
    </header>
  )
}
