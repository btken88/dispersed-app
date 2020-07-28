import React from 'react'
import { useWebMap } from 'esri-loader-hooks'
import { loadCss } from 'esri-loader'

export default function MapContainer() {
  loadCss()
  const [ref] = useWebMap('8721657ca98f4cbc9e9411a03da37951')

  return (
    <div className="map-container">
      <div className="webmap" ref={ref} />
    </div>
  )
}
