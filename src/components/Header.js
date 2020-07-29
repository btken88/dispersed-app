import React from 'react'
import { Link, NavLink } from 'react-router-dom'
export default function Header() {
  return (
    <header>
      <h1><Link to='/'>Dispersed</Link></h1>
      <ul className="navigation">
        <li><NavLink to='/map' activeClassName="active-link">Map</NavLink></li>
        <li><NavLink to='/favorites' activeClassName="active-link">Favorites</NavLink></li>
        <li><NavLink to='/about' activeClassName="active-link">About</NavLink></li>
      </ul>
    </header>
  )
}
