import React, { useRef, useEffect } from 'react'
import { loadModules } from 'esri-loader'


export default function MapContainer({ center, points, zoom }) {
  const containerRef = useRef()
  const viewRef = useRef(null)

  // USFS Motor Vehicle Use Map (MVUM) service
  const MVUM_SERVICE_URL = 'https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_MVUM_02/MapServer';

  useEffect(() => {
    let isMounted = true;

    // Load ArcGIS API modules
    loadModules([
      'esri/views/MapView',
      'esri/Map',
      'esri/layers/MapImageLayer',
      'esri/Graphic',
      'esri/layers/GraphicsLayer'
    ])
      .then(([MapView, Map, MapImageLayer, Graphic, GraphicsLayer]) => {
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
          center: center,
          zoom: zoom
        });

        viewRef.current = view;

        const graphicsLayer = new GraphicsLayer()
        map.add(graphicsLayer)

        points.forEach(point => {
          const newPoint = {
            type: "point",
            longitude: point.lng,
            latitude: point.lat
          }

          const marker = {
            type: 'simple-marker',
            color: [42, 80, 51], // orange
            outline: {
              color: [234, 237, 233], // white
              width: 1
            }
          }

          const attributes = {
            Name: `Lat: ${point.lng.toFixed(4)} Lng: ${point.lng.toFixed(4)}`,
            Notes: point.note
          }

          const popupTemplate = {
            title: "{Name}",
            content: "{Notes}"
          }

          const pointGraphic = new Graphic({
            geometry: newPoint,
            symbol: marker,
            attributes,
            popupTemplate
          })

          graphicsLayer.add(pointGraphic)
        })
      })
      .catch(err => {
        // handle any errors
        console.error('Error loading map:', err);
      });

    return () => {
      isMounted = false;
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [center, points, zoom]);

  return (
    <div className="favorites-map" ref={containerRef} />
  )
}
