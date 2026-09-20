import { useState, useEffect } from 'react';
import { CloudSun, MapPin } from 'lucide-react';

function WeatherCard() {
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [weather, setWeather] = useState({ temp: '--', condition: 'Fetching weather...' });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        setLocation({ lat, lon });

        // Fetch live weather from API using your key
        try {
          const API_KEY = 'c0f64757bb2812b0cd6d47218fa38f18';
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
          );
          const data = await response.json();

          if (response.ok) {
            setWeather({
              temp: `${Math.round(data.main.temp)}°C`,
              condition: data.weather[0].main,
            });
          }
        } catch (err) {
          console.error("Error fetching live weather:", err);
        }

        setLoading(false);
      },
      () => {
        setErrorMsg("Location access denied. Displaying general regional data.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  return (
    <div className="glass">
      <h3 className="panel-title"><CloudSun size={20} /> Your Live Local Weather</h3>

      {loading && <p className="soft">📡 Detecting your GPS location...</p>}

      {errorMsg && <p className="note note-warn">⚠️ {errorMsg}</p>}

      {location.lat && (
        <div className="weather-readout">
          <p><MapPin size={16} /> <strong>Coordinates:</strong> {location.lat.toFixed(4)}, {location.lon.toFixed(4)}</p>
          <p className="weather-big">
            {weather.temp} | {weather.condition} Alert
          </p>
          <small>Updated based on your exact live location.</small>
        </div>
      )}
    </div>
  );
}

export default WeatherCard;
