import { useEffect, useState } from 'react';

export default function AutoWeather() {
  const [weatherData, setWeatherData] = useState({
    coords: 'Loading coordinates...',
    temp: '--',
    condition: 'Fetching weather...',
  });

  useEffect(() => {
    const API_KEY = 'c0f64757bb2812b0cd6d47218fa38f18';

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

          try {
            const res = await fetch(url);
            const data = await res.json();

            setWeatherData({
              coords: `Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
              temp: Math.round(data.main.temp),
              condition: data.weather[0].main,
            });
          } catch (err) {
            console.error('Error fetching weather:', err);
          }
        },
        (err) => console.error('Geolocation error:', err)
      );
    }
  }, []);

  return (
    <div className="weather-container">
      <h3>Your Live Local Weather</h3>
      <p>{weatherData.coords}</p>
      <h2>{weatherData.temp}°C | {weatherData.condition} Alert</h2>
      <small>Updated based on your exact live location.</small>
    </div>
  );
}