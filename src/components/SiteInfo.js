import React from 'react'

export default function SiteInfo({ favorite, setSettings }) {
  const { lat, lng, note } = favorite

  function chooseFavorite(e) {
    e.stopPropagation()
    setSettings({
      zoom: 15,
      center: [lng, lat]
    })
  }
  return (
    <div className="site-info" onClick={chooseFavorite}>
      <p>Lat: {lat.toFixed(4)}</p>
      <p>Lng: {lng.toFixed(4)}</p>
      <p className='note'>{note}</p>
    </div>
  )
}
