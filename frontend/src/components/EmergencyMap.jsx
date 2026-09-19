import { useEffect, useState } from 'react';

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline
} from 'react-leaflet';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';


const shelters = [
  {
    id: 1,
    name: 'Community Relief Centre',
    lat: 10.1900,
    lng: 76.3860,
    capacity: 200
  },
  {
    id: 2,
    name: 'Emergency Shelter',
    lat: 10.1850,
    lng: 76.3920,
    capacity: 150
  }
];


const dangerZones = [
  {
    id: 1,
    name: 'Flooded Road',
    lat: 10.1880,
    lng: 76.3890,
    radius: 300
  },
  {
    id: 2,
    name: 'High Flood Risk Area',
    lat: 10.1920,
    lng: 76.3950,
    radius: 400
  }
];


const userIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});


function EmergencyMap() {

  const [location, setLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [error, setError] = useState('');
  const [routeLoading, setRouteLoading] = useState(false);


  // GET USER'S LIVE LOCATION
  useEffect(() => {

    if (!navigator.geolocation) {
      setError('GPS is not supported by this browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(

      (position) => {

        setLocation([
          position.coords.latitude,
          position.coords.longitude
        ]);

      },

      () => {
        setError('Unable to get your current location.');
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }

    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };

  }, []);


  // GET ROUTE TO SHELTER
  const getRoute = async (shelter) => {

    if (!location) {
      return;
    }

    setRouteLoading(true);
    setRoute([]);


    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${location[1]},${location[0]};` +
      `${shelter.lng},${shelter.lat}` +
      `?overview=full&geometries=geojson`;


    try {

      console.log('Requesting route:', url);

      const response = await fetch(url);

      const data = await response.json();

      console.log('OSRM response:', data);


      if (data.routes && data.routes.length > 0) {

        const coordinates = data.routes[0].geometry.coordinates;

        const routePoints = coordinates.map(([lng, lat]) => [
          lat,
          lng
        ]);

        setRoute(routePoints);

      } else {

        console.error('No route found');

      }

    } catch (error) {

      console.error('Route error:', error);

    } finally {

      setRouteLoading(false);

    }

  };


  // GPS ERROR
  if (error) {

    return (
      <div className="glass-card">

        <h2>Emergency Map</h2>

        <p>{error}</p>

      </div>
    );

  }


  // WAITING FOR GPS
  if (!location) {

    return (
      <div className="glass-card">

        <h2>Emergency Map</h2>

        <p>📍 Detecting your location...</p>

      </div>
    );

  }


  return (

    <div
      className="glass-card"
      style={{
        padding: '20px'
      }}
    >

      <h2>🗺️ Emergency Map</h2>

      <p>
        📍 Your current location
      </p>


      {routeLoading && (
        <p>
          🛣️ Calculating route...
        </p>
      )}


      <MapContainer
        center={location}
        zoom={14}
        style={{
          height: '500px',
          width: '100%',
          borderRadius: '15px'
        }}
      >

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* USER LOCATION */}

        <Marker
          position={location}
          icon={userIcon}
        >

          <Popup>
            📍 You are here
          </Popup>

        </Marker>


        {/* RELIEF SHELTERS */}

        {shelters.map((shelter) => (

          <Marker
            key={shelter.id}
            position={[
              shelter.lat,
              shelter.lng
            ]}
            icon={userIcon}
          >

            <Popup>

              <strong>
                🏠 {shelter.name}
              </strong>

              <br />

              Capacity: {shelter.capacity} people

              <br />

              <button
                onClick={() => getRoute(shelter)}
                style={{
                  marginTop: '8px',
                  padding: '6px 10px',
                  cursor: 'pointer'
                }}
              >

                🛣️ Get Route

              </button>

            </Popup>

          </Marker>

        ))}


        {/* DANGER ZONES */}

        {dangerZones.map((zone) => (

          <Circle
            key={zone.id}
            center={[
              zone.lat,
              zone.lng
            ]}
            radius={zone.radius}
            pathOptions={{
              color: 'red',
              fillColor: 'red',
              fillOpacity: 0.25
            }}
          >

            <Popup>

              <strong>
                ⚠️ {zone.name}
              </strong>

              <br />

              Avoid this area if possible.

            </Popup>

          </Circle>

        ))}


        {/* ROUTE */}

        {route.length > 0 && (

          <Polyline
            positions={route}
            pathOptions={{
              color: '#2563eb',
              weight: 6
            }}
          />

        )}

      </MapContainer>

    </div>

  );

}


export default EmergencyMap;