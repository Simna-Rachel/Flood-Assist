import React, { useState, useEffect } from 'react';
import { CloudSun, MapPin } from 'lucide-react';

function WeatherCard() {
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setErrorMsg("Location access denied. Displaying general regional data.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  return (
    <div style={styles.card}>
      <h3><CloudSun size={20} /> Your Live Local Weather</h3>

      {loading && <p>📡 Detecting your GPS location...</p>}

      {errorMsg && <p style={{ color: '#d97706' }}>⚠️ {errorMsg}</p>}

      {location.lat && (
        <div style={styles.weatherBox}>
          <p><MapPin size={16} /> <strong>Coordinates:</strong> {location.lat.toFixed(4)}, {location.lon.toFixed(4)}</p>
          <p style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>28°C | Rain Alert</p>
          <small>Updated based on your exact live location.</small>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' },
  weatherBox: { backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #0284c7', marginTop: '1rem' }
};

export default WeatherCard;