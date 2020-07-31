import React, { useState } from 'react'

export default function FavoriteSiteInfo({ favorite, setSettings, favorites, setFavorites }) {
  const [note, setNote] = useState(favorite.note)
  const [update, setUpdate] = useState(false)

  const { lat, lng } = favorite

  function toggleUpdate() {
    setUpdate(!update)
  }

  function submitUpdate() {
    const newFavorite = { ...favorite }
    newFavorite.note = note
    fetch('http://localhost:5000/favorites', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token')
      },
      body: JSON.stringify(newFavorite)
    })
    const newFavoriteList = favorites.map(favorite => {
      return (favorite.id === newFavorite.id) ? newFavorite : favorite
    })
    setFavorites(newFavoriteList)
    setUpdate(!update)
  }

  function chooseFavorite(e) {
    e.stopPropagation()
    setSettings({
      zoom: 15,
      center: [lng, lat]
    })
  }
  return (
    <div className='site-info'>
      <div className='lat-lng'>
        <p>Lat: {lat.toFixed(4)}</p>
        <p>Lng: {lng.toFixed(4)}</p>
      </div>
      <button className='see-site' onClick={chooseFavorite}>See Site</button>
      <p className='note'>Notes:</p>
      {update
        ? <textarea className='note' value={note} onChange={e => setNote(e.target.value)} />
        : <p className='note'>{note}</p>}
      <button className='update' onClick={update ? submitUpdate : toggleUpdate}>Update</button>
      <a href={`https://www.google.com/maps/dir/''/${lat},${lng}`} target="blank">Get there with Google</a>
    </div>
  )
}