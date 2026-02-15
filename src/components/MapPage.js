import React, { useEffect, useRef, useState } from 'react'
import { loadModules, loadCss } from 'esri-loader'
import Modal from './Modal'
import '../component-css/map-page.css'
import Header from './Header'
import Footer from './Footer'

loadCss()

export default function MapPage({ favorites, setFavorites, ...props }) {
  const [point, setPoint] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const containerRef = useRef()
  const viewRef = useRef(null)

  // USFS Motor Vehicle Use Map (MVUM) service
  const MVUM_SERVICE_URL = 'https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_MVUM_02/MapServer';
  const DEFAULT_CENTER_LNG = parseFloat(process.env.REACT_APP_MAP_CENTER_LNG) || -105.6598;
  const DEFAULT_CENTER_LAT = parseFloat(process.env.REACT_APP_MAP_CENTER_LAT) || 39.821;
  const DEFAULT_ZOOM = parseInt(process.env.REACT_APP_MAP_ZOOM) || 11;

  useEffect(() => {
    document.title = "Dispersed - Map"
    let isMounted = true;

    // Load ArcGIS API modules
    loadModules(['esri/views/MapView', 'esri/Map', 'esri/layers/MapImageLayer'])
      .then(([MapView, Map, MapImageLayer]) => {
        if (!isMounted) return;

        // Create the MVUM layer from the Map Service
        const mvumLayer = new MapImageLayer({
          url: MVUM_SERVICE_URL,
          title: 'USFS Motor Vehicle Use Map'
        });

        // Create a map with the MVUM layer
        const map = new Map({
          basemap: 'topo-vector',
          layers: [mvumLayer]
        });

        // Show the map in a container
        const view = new MapView({
          map: map,
          container: containerRef.current,
          center: [DEFAULT_CENTER_LNG, DEFAULT_CENTER_LAT],
          zoom: DEFAULT_ZOOM
        });

        viewRef.current = view;

        view.when(() => {
          if (isMounted) {
            setLoading(false);
          }
        }).catch((err) => {
          if (isMounted) {
            setError('Failed to load map');
            setLoading(false);
          }
        });

        // event listener to pull gps location out of user click
        view.on('click', (event) => {
          const point = {
            lat: view.toMap(event).latitude,
            lng: view.toMap(event).longitude
          }
          setPoint(point)
        })
      })
      .catch(err => {
        // handle any errors
        console.error('Error loading ArcGIS modules:', err);
        if (isMounted) {
          setError('Failed to load map modules');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [DEFAULT_CENTER_LNG, DEFAULT_CENTER_LAT, DEFAULT_ZOOM]);

  return (
    <div className="map-page">
      <Header />
      {loading && <div className="loading">Loading map...</div>}
      {error && <div className="error">{error}</div>}
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