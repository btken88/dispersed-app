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
    <div className='site-info'>
      <div className='lat-lng'>
        <p>Lat: {lat.toFixed(4)}</p>
        <p>Lng: {lng.toFixed(4)}</p>
      </div>
      <button className='see-site' onClick={chooseFavorite}>See Site</button>
      <p className='note'>Notes:</p>
      <p className='note'>{note}</p>
      <a href={`https://www.google.com/maps/dir/''/${lat},${lng}`} target="blank">Get there with Google</a>
    </div>
  )
}
