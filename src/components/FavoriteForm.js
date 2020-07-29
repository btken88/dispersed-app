import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

export default function FavoriteForm({ point, setShowForm, showForm, favorites, setFavorites }) {
  const [formData, setFormData] = useState({
    lat: point.lat,
    lng: point.lng,
    note: ""
  })

  const history = useHistory()

  function handleSubmit(e) {
    e.preventDefault()
    setFavorites([...favorites, formData])
    fetch('http://localhost:5000/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(response => response.json())
      .then(favorite => setFavorites([...favorites, favorite]))
      .then(history.push('/favorites'))
    setShowForm(!showForm)
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      note: e.target.value
    })
  }

  return (
    <form onSubmit={handleSubmit} onClick={e => e.stopPropagation()} className="modal-card">
      <h2>Add Site to Favorites</h2>
      <p>Lat: {formData.lat.toFixed(4)}</p>
      <p>Lng: {formData.lng.toFixed(4)}</p>
      <label>Notes:</label>
      <input type="textarea" name="note" value={formData.note} onChange={handleChange} />
      <div className="favorite-buttons">
        <button onClick={handleSubmit}>Add Favorite</button>
        <button onClick={() => setShowForm(!showForm)}>Back to Conditions</button>
      </div>
    </form>
  )
}
