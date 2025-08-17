// src/components/WorldMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet's CSS
import { useNavigate } from 'react-router-dom'; // <--- Import useNavigate

interface CountryData {
  Country_ID: string;
  Country_Title: string;
  product_count: number;
  supplier_count: number;
}

interface WorldMapProps {
  countryData?: CountryData[]; // Expect an array of CountryData
}

export default function WorldMap({ countryData }: WorldMapProps) {
  const [geoJsonData, setGeoJsonData] = useState<GeoJSON.GeoJson | null>(null);
  const navigate = useNavigate(); // <--- Initialize useNavigate
  const position: [number, number] = [0, 0];
  const zoom = 2;

  // Create a lookup map for country data
  const countryDataMap = React.useMemo(() => {
    const map = new Map<string, CountryData>();
    countryData?.forEach(country => {
      // Use Country_Title for lookup, as GeoJSON 'name' property often matches this
      map.set(country.Country_Title, country); 
    });
    return map;
  }, [countryData]);

  // Fetch GeoJSON data when component mounts
  useEffect(() => {
    async function fetchGeoJSON() {
      try {
        const response = await fetch('/GEOJSON/ne_50m_admin_0_countries.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGeoJsonData(data);
      } catch (error) {
        console.error("Error fetching GeoJSON data:", error);
      }
    }
    fetchGeoJSON();
  }, []);

  // Function to style each country feature
  const style = (feature: any) => {
    const countryName = feature.properties.name;
    const data = countryDataMap.get(countryName);

    let fillColor = '#333333'; // Default color for countries not in your data
    if (data) {
      // Example: Color based on product count (you can adjust this logic)
      if (data.product_count > 1000) {
        fillColor = '#F4A024'; // High product count
      } else if (data.product_count > 100) {
        fillColor = '#F4A02480'; // Medium product count (50% opacity)
      } else if (data.product_count > 0) {
        fillColor = '#F4A02440'; // Low product count (25% opacity)
      }
    }

    return {
      fillColor: fillColor,
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  // Function to add interactivity to each country feature
  const onEachFeature = (feature: any, layer: any) => {
    const countryName = feature.properties.name;
    const data = countryDataMap.get(countryName);

    if (data) {
      layer.on({
        click: () => {
          console.log('Clicked on:', countryName, 'ID:', data.Country_ID);
          // Navigate to the search page for this country
          navigate(`/search?country=${data.Country_ID}`);
        },
        // Optional: Add hover effects
        mouseover: (e: any) => {
          e.target.setStyle({
            fillOpacity: 0.9,
            weight: 2,
            color: '#F4A024'
          });
          // You can also add a tooltip here
          layer.bindTooltip(`${countryName}<br/>Products: ${data.product_count}<br/>Suppliers: ${data.supplier_count}`, {
            permanent: false,
            direction: 'auto'
          }).openTooltip();
        },
        mouseout: (e: any) => {
          // Reset style on mouseout
          e.target.setStyle(style(feature));
          layer.closeTooltip();
        }
      });
    } else {
      // For countries not in your data, still allow basic hover/click if desired
      layer.on({
        mouseover: (e: any) => {
          e.target.setStyle({
            fillOpacity: 0.9,
            weight: 2,
            color: '#cccccc'
          });
          layer.bindTooltip(`${countryName}<br/>No data available`, {
            permanent: false,
            direction: 'auto'
          }).openTooltip();
        },
        mouseout: (e: any) => {
          e.target.setStyle(style(feature));
          layer.closeTooltip();
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
