import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const { isAuthenticated, logout } = useAuth()

  async function handleLogOut() {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header id='header'>
      <h1><Link to='/'>Dispersed</Link></h1>
      <ul className="navigation">
        <li><NavLink to='/about' className={({ isActive }) => isActive ? 'active-link' : ''}>About</NavLink></li>
        <li><NavLink to='/map' className={({ isActive }) => isActive ? 'active-link' : ''}>Map</NavLink></li>
        {isAuthenticated
          ? (
            <>
              <li><NavLink to='/' onClick={handleLogOut}>Log Out</NavLink></li>
              <li><NavLink to='/favorites' className={({ isActive }) => isActive ? 'active-link' : ''}>Favorites</NavLink></li>
            </>)
          : <li><NavLink to='/login' className={({ isActive }) => isActive ? 'active-link' : ''}>Log In</NavLink></li>
        }
      </ul>
    </header>
  )
}
