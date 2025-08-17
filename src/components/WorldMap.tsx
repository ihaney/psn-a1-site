import React, { useEffect, useRef, useState } from 'react'; // Add useState
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet's CSS

interface WorldMapProps {
  // You'll pass data to this component later, e.g., country-specific metrics
  countryData?: Record<string, any>; 
}

export default function WorldMap({ countryData }: WorldMapProps) {
  const [geoJsonData, setGeoJsonData] = useState<GeoJSON.GeoJson | null>(null); // State to hold GeoJSON data
  const position: [number, number] = [0, 0]; // Latitude, Longitude
  const zoom = 2; // Initial zoom level

  // Fetch GeoJSON data when component mounts
  useEffect(() => {
    async function fetchGeoJSON() {
      try {
        // Corrected path to your GeoJSON file
        const response = await fetch('/GEOJSON/ne_50m_admin_0_countries.json'); 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGeoJsonData(data);
      } catch (error) {
        console.error("Error fetching GeoJSON data:", error);
        // Handle error, e.g., set an error state or show a message
      }
    }
    fetchGeoJSON();
  }, []); // Empty dependency array means this runs once on mount

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
        {/* Render GeoJSON layer only when data is loaded */}
        {geoJsonData && geoJsonData.features.length > 0 && (
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
