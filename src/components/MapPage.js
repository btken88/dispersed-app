import React, { useEffect, useRef, useState } from 'react'
import { loadModules, loadCss } from 'esri-loader'
import Modal from './Modal'
import '../component-css/map-page.css'
import Header from './Header'
import Footer from './Footer'

loadCss()

export default function MapPage({ favorites, setFavorites, ...props }) {
  const [point, setPoint] = useState({})
  const containerRef = useRef()

  useEffect(() => {
    document.title = "Dispersed - Map"
    // Code here from ArcGIS documentation
    // this will lazy load the ArcGIS API
    // and then use Dojo's loader to require the classes
    loadModules(['esri/views/MapView', 'esri/WebMap'])
      .then(([MapView, WebMap]) => {
        // then we load a web map from an id
        const webmap = new WebMap({
          portalItem: { // autocasts as new PortalItem()
            id: '8721657ca98f4cbc9e9411a03da37951'
          }
        });
        // and we show that map in a container w/ id #viewDiv
        const view = new MapView({
          map: webmap,
          container: containerRef.current,
          center: [-105.6598, 39.821],
          zoom: 11
        });

        // event listener to pull gps location out of user click
        view.on('click', (event) => {
          const point = {
            lat: view.toMap(event).latitude,
            lng: view.toMap(event).longitude
          }
          setPoint(point)
        })

        return () => {
          if (view) {
            // destroy the map view
            view.container = null;
          }
        };
      })
      .catch(err => {
        // handle any errors
        console.error(err);
      });
  }, []);

  return (
    <div className="map-page">
      <Header />
      <p className="map-instructions">Click on the map to view details</p>
      <div className="map-page-map" ref={containerRef} />
      {point.lat
        ? <Modal
          point={point}
          setPoint={setPoint}
          favorites={favorites}
          setFavorites={setFavorites}
          props={props} />
        : null}
      <Footer />
    </div>
  )
}