import React from 'react'
import { Link, NavLink } from 'react-router-dom'
export default function Header() {
  const loggedIn = localStorage.getItem('token')

  function logOut() {
    localStorage.removeItem('token')
  }

  return (
    <header id='header'>
      <h1><Link to='/'>Dispersed</Link></h1>
      <ul className="navigation">
        <li><NavLink to='/about' activeClassName="active-link">About</NavLink></li>
        <li><NavLink to='/map' activeClassName="active-link">Map</NavLink></li>
        {!!loggedIn
          ? (
            <>
              <li><NavLink to='/' onClick={logOut}>Log Out</NavLink></li>
              <li><NavLink to='/favorites' activeClassName="active-link">Favorites</NavLink></li>
            </>)
          : <li><NavLink to='/login' activeClassName='active-link'>Log In</NavLink></li>
        }
      </ul>
    </header>
  )
}
