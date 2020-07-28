import React, { useEffect, useRef, useState } from 'react'
import { loadModules, loadCss } from 'esri-loader'
import InfoCard from './InfoCard'
import '../component-css/mapContainer.css'

loadCss()

export default function CustomMapContainer() {
  const [point, setPoint] = useState({})
  const containerRef = useRef()

  useEffect(() => {
    // Code here from ArcGIS documentation
    // this will lazy load the ArcGIS API
    // and then use Dojo's loader to require the classes
    loadModules(['esri/views/MapView', 'esri/WebMap', 'esri/widgets/Legend'])
      .then(([MapView, ArcGISMap, Legend]) => {
        // then we load a web map from an id
        const webmap = new ArcGISMap({
          portalItem: { // autocasts as new PortalItem()
            id: '8721657ca98f4cbc9e9411a03da37951'
          }
        });
        // and we show that map in a container w/ id #viewDiv
        var view = new MapView({
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
    <div className="map-container">
      <div className="webmap" ref={containerRef} />
      {point.lat ? <InfoCard point={point} setPoint={setPoint} /> : null}
    </div>
  )
}