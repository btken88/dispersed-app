import React, { useRef, useEffect } from 'react'
import { loadModules } from 'esri-loader'


export default function MapContainer({ center, points, zoom }) {
  const containerRef = useRef()
  useEffect(() => {
    // Code here from ArcGIS documentation
    // this will lazy load the ArcGIS API
    // and then use Dojo's loader to require the classes
    loadModules([
      'esri/views/MapView',
      'esri/WebMap',
      'esri/Graphic',
      'esri/layers/GraphicsLayer'
    ])
      .then(([MapView, WebMap, Graphic, GraphicsLayer]) => {
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
          center: center,
          zoom: zoom
        });

        const graphicsLayer = new GraphicsLayer()
        webmap.add(graphicsLayer)

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
  }, [center, points, zoom]);

  return (
    <div className="favorites-map" ref={containerRef} />
  )
}
