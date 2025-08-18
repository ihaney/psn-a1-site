import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { Separator } from './ui/separator';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create a custom icon with your brand color
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="#F4A024" stroke="#000" stroke-width="1" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface CountryData {
  Country_ID: string;
  Country_Title: string;
  Country_Image: string | null;
  product_count: number;
  supplier_count: number;
  sources_count: number;
  latitude?: number;
  longitude?: number;
}

interface WorldMapProps {
  countryData?: CountryData[];
}

export default function WorldMap({ countryData }: WorldMapProps) {
  const [geoJsonData, setGeoJsonData] = useState<GeoJSON.GeoJson | null>(null);
  const navigate = useNavigate();
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
      weight: 0,
      opacity: 0,
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
          navigate(`/search?q=${encodeURIComponent(data.Country_Title)}&mode=products`);
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
        
        {/* Render country shapes */}
        {geoJsonData && geoJsonData.features.length > 0 && (
          <GeoJSON 
            data={geoJsonData} 
            style={style} 
            onEachFeature={onEachFeature} 
          />
        )}

        {/* Render markers for countries with coordinates */}
        {countryData?.map(country => (
          country.latitude && country.longitude ? (
            <Marker 
              key={country.Country_ID} 
              position={[country.latitude, country.longitude]}
              icon={customIcon}
            >
              <Popup>
                <div 
                  className="min-w-[280px] cursor-pointer bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/search?q=${encodeURIComponent(country.Country_Title)}&mode=products`);
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    {country.Country_Image && (
                      <img
                        src={country.Country_Image}
                        alt={country.Country_Title}
                        className="w-12 h-12 object-contain rounded-full"
                      />
                    )}
                    <div>
                      <h2 className="text-xl font-semibold text-gray-100">
                        {country.Country_Title}
                      </h2>
                      <p className="text-[#F4A024] font-medium">
                        {country.product_count} products
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="bg-gray-700 mb-4" />
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Products:</span>
                      <span className="text-gray-100 font-medium">{country.product_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Suppliers:</span>
                      <span className="text-gray-100 font-medium">{country.supplier_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Sources:</span>
                      <span className="text-gray-100 font-medium">{country.sources_count}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
}