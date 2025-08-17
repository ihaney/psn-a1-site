import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet's CSS

// You will need to import your GeoJSON data here
// For now, we'll use a placeholder.
// If you placed it in `public/ne_50m_admin_0_countries.json`, you might fetch it.
// For demonstration, let's assume it's imported or fetched.
// import worldGeoJSON from '../../public/ne_50m_admin_0_countries.json'; // Example if importing directly

interface WorldMapProps {
  // You'll pass data to this component later, e.g., country-specific metrics
  countryData?: Record<string, any>; 
}

export default function WorldMap({ countryData }: WorldMapProps) {
  // Default position for the map (e.g., center of the world)
  const position: [number, number] = [0, 0]; // Latitude, Longitude
  const zoom = 2; // Initial zoom level

  // Placeholder for GeoJSON data. You'll replace this with your actual loaded data.
  const geoJsonData: GeoJSON.GeoJson = {
    type: 'FeatureCollection',
    features: [] // This will be populated with your country data
  };

  // Function to style each country feature
  const style = (feature: any) => {
    return {
      fillColor: '#333333', // Default fill color for countries
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  // Function to add interactivity to each country feature
  const onEachFeature = (feature: any, layer: any) => {
    // You'll add hover effects and tooltips here later
    // For now, let's just log the country name on click
    if (feature.properties && feature.properties.name) {
      layer.on({
        click: () => {
          console.log('Clicked on:', feature.properties.name);
          // You might navigate to a search page or show more details here
        }
      });
    }
  };

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer 
        center={position} 
        zoom={zoom} 
        scrollWheelZoom={false} 
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* GeoJSON layer will go here. We'll load the data dynamically. */}
        {geoJsonData.features.length > 0 && (
          <GeoJSON 
            data={geoJsonData} 
            style={style} 
            onEachFeature={onEachFeature} 
          />
        )}
      </MapContainer>
    </div>
  );
}
