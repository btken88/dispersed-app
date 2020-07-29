import React from 'react'

export default function SiteInfo({ favorite }) {
  const { lat, lng, note } = favorite
  return (
    <div className="site-info">
      <p>Lat: {lat.toFixed(4)}</p>
      <p>Lng: {lng.toFixed(4)}</p>
      <p>{note}</p>
    </div>
  )
}
