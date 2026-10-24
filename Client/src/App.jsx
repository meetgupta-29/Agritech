import './App.css';
import { useEffect, useState } from 'react';
import Login from "./Login";
import Marketplace from "./Marketplace";
const API_URL = 'http://localhost:5000';

function App() {
  const [loggedInUser, setLoggedInUser] = useState(() => {
  try {
    const savedUser = localStorage.getItem("agritech_user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
});
  const [apiStatus, setApiStatus] = useState('Connecting...');
  const [crops, setCrops] = useState([]);
  const [cropError, setCropError] = useState('');

  // Crop Recommendation states
const [soilType, setSoilType] = useState('Loamy');
const [season, setSeason] = useState('Kharif');
const [temperature, setTemperature] = useState('28');
const [rainfall, setRainfall] = useState('100');
const [recommendations, setRecommendations] = useState([]);
const [recommendationMessage, setRecommendationMessage] = useState('');

// Soil Health Analyzer states
const [soilPH, setSoilPH] = useState('6.5');
const [nitrogen, setNitrogen] = useState('50');
const [phosphorus, setPhosphorus] = useState('30');
const [potassium, setPotassium] = useState('30');
const [soilAnalysis, setSoilAnalysis] = useState(null);
const [soilError, setSoilError] = useState('');

  // Weather states
const [city, setCity] = useState('Indore');
const [searchCity, setSearchCity] = useState('Indore');
const [weather, setWeather] = useState(null);
const [weatherError, setWeatherError] = useState('');
const [weatherLoading, setWeatherLoading] = useState(false);
const [forecast, setForecast] = useState([]);
const [forecastError, setForecastError] = useState('');
const [forecastLoading, setForecastLoading] = useState(false);
  // Fetch weather from our backend
  const fetchWeather = async (cityName = searchCity) => {
    const requestedCity = cityName.trim();

    if (!requestedCity) {
      setWeatherError('Please enter a city name.');
      return;
    }

    setWeatherLoading(true);
    setWeatherError('');

    try {
      const response = await fetch(
        `${API_URL}/api/weather?city=${encodeURIComponent(requestedCity)}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load weather.');
      }

      setWeather(data);
      setCity(data.city);
      setSearchCity(data.city);
      fetchForecast(data.city);
    } catch (error) {
      setWeatherError(error.message || 'Unable to connect to weather service.');
    } finally {
      setWeatherLoading(false);
    }
  };
  
  const fetchForecast = async (cityName = city) => {
    setForecastLoading(true);
    setForecastError('');

    try {
      const response = await fetch(
        `${API_URL}/api/forecast?city=${encodeURIComponent(cityName)}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load forecast.');
      }

      setForecast(data.forecast || []);
    } catch (error) {
      setForecastError(error.message || 'Unable to load forecast.');
      setForecast([]);
    } finally {
      setForecastLoading(false);
    }
  };

  const recommendCrops = (event) => {
  event.preventDefault();

  const temp = Number(temperature);
  const rain = Number(rainfall);

  if (
    temperature.trim() === '' ||
    rainfall.trim() === '' ||
    !Number.isFinite(temp) ||
    !Number.isFinite(rain) ||
    temp < -10 ||
    temp > 60 ||
    rain < 0 ||
    rain > 5000
  ) {
    setRecommendations([]);
    setRecommendationMessage(
      'Please enter a valid temperature (-10 to 60°C) and rainfall (0 to 5000 mm).'
    );
    return;
  }

  const cropRules = [
    {
      name: 'Rice',
      icon: '🌾',
      seasons: ['Kharif'],
      soils: ['Clayey', 'Loamy'],
      minTemp: 20,
      maxTemp: 35,
      minRain: 100,
      reason: 'Warm weather and higher rainfall can support rice cultivation.'
    },
    {
      name: 'Wheat',
      icon: '🌾',
      seasons: ['Rabi'],
      soils: ['Loamy', 'Black'],
      minTemp: 10,
      maxTemp: 25,
      minRain: 25,
      reason: 'Cooler weather and well-drained soil can suit wheat.'
    },
    {
      name: 'Maize',
      icon: '🌽',
      seasons: ['Kharif', 'Rabi'],
      soils: ['Loamy', 'Black'],
      minTemp: 18,
      maxTemp: 35,
      minRain: 50,
      reason: 'Warm conditions and moderate rainfall can support maize.'
    },
    {
      name: 'Soybean',
      icon: '🫘',
      seasons: ['Kharif'],
      soils: ['Loamy', 'Black'],
      minTemp: 20,
      maxTemp: 32,
      minRain: 60,
      reason: 'Warm conditions and suitable rainfall can support soybean.'
    },
    {
      name: 'Mustard',
      icon: '🌼',
      seasons: ['Rabi'],
      soils: ['Loamy', 'Sandy'],
      minTemp: 10,
      maxTemp: 25,
      minRain: 20,
      reason: 'Mustard generally grows well in cooler conditions with limited to moderate rainfall.'
    },
    {
      name: 'Cotton',
      icon: '🌱',
      seasons: ['Kharif'],
      soils: ['Black', 'Loamy'],
      minTemp: 21,
      maxTemp: 35,
      minRain: 50,
      reason: 'Warm conditions and suitable soil can support cotton cultivation.'
    }
  ];

  const matches = cropRules
    .map((crop) => {
      let score = 0;

      if (crop.seasons.includes(season)) score += 2;
      if (crop.soils.includes(soilType)) score += 2;
      if (temp >= crop.minTemp && temp <= crop.maxTemp) score += 2;
      if (rain >= crop.minRain) score += 2;

      return { ...crop, score };
    })
    .filter((crop) => crop.score >= 4)
    .sort((a, b) => b.score - a.score);

  setRecommendations(matches);
  setRecommendationMessage(
    matches.length
      ? 'These crops match some of your selected conditions. Confirm local suitability before planting.'
      : 'No strong match found. Try changing your inputs or consult a local agriculture expert.'
  );
};
  const analyzeSoil = (event) => {
  event.preventDefault();
  setSoilError('');
  setSoilAnalysis(null);

  const ph = Number(soilPH);
  const n = Number(nitrogen);
  const p = Number(phosphorus);
  const k = Number(potassium);

  if (
    soilPH.trim() === '' ||
    nitrogen.trim() === '' ||
    phosphorus.trim() === '' ||
    potassium.trim() === '' ||
    ![ph, n, p, k].every(Number.isFinite) ||
    ph < 0 || ph > 14 ||
    n < 0 || p < 0 || k < 0 ||
    n > 1000 || p > 1000 || k > 1000
  ) {
    setSoilError(
      'Enter a pH between 0 and 14 and nutrient values between 0 and 1000.'
    );
    return;
  }

  let phMessage = '';

  if (ph < 5.5) {
    phMessage = 'Soil is strongly acidic. Check crop-specific pH needs and consider a soil test before making amendments.';
  } else if (ph < 6.0) {
    phMessage = 'Soil is moderately acidic. Some crops may need pH management based on local recommendations.';
  } else if (ph <= 7.5) {
    phMessage = 'Soil pH is within a range suitable for many common crops.';
  } else if (ph <= 8.5) {
    phMessage = 'Soil is alkaline. Check nutrient availability and crop-specific pH tolerance.';
  } else {
    phMessage = 'Soil is strongly alkaline. A laboratory soil test is recommended before changing soil chemistry.';
  }

  const nutrients = [
    { name: 'Nitrogen', value: n },
    { name: 'Phosphorus', value: p },
    { name: 'Potassium', value: k }
  ];

  const nutrientMessage = nutrients
    .map((item) => {
      let level = 'entered value';

      if (item.value < 10) level = 'low numeric value';
      else if (item.value < 40) level = 'moderate numeric value';
      else level = 'high numeric value';

      return `${item.name}: ${level} (${item.value})`;
    });

  setSoilAnalysis({
    ph,
    phMessage,
    nutrientMessage
  });
};
if (window.location.pathname === "/login") {
  return (
    <Login
      onBackHome={() => {
        window.history.pushState({}, "", "/");
        window.location.reload();
      }}
    />
  );
}
if (!loggedInUser) {
  window.location.href = "/login";
  return null;
}
  useEffect(() => {
    // Check backend health
    fetch(`${API_URL}/api/health`)
      .then((response) => {
        if (!response.ok) throw new Error('Health check failed');
        return response.json();
      })
      .then((data) => setApiStatus(data.message))
      .catch(() => setApiStatus('Backend connection failed'));

    // Fetch crops
    fetch(`${API_URL}/api/crops`)
      .then((response) => {
        if (!response.ok) throw new Error('Could not load crops');
        return response.json();
      })
      .then((data) => {
        setCrops(data.data || []);
        setCropError('');
      })
      .catch(() => {
        setCropError('Unable to load crops. Please check the backend.');
      });

    // Load default city weather
    fetchWeather('Indore');
  }, []);
  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <a className="logo" href="#home">🌱 AgriTech</a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#crops">Crops</a>
          <a href="#weather">Weather</a>
          <a href="#recommend">Crop Recommendation</a>
          <a href="#soil-health">Soil Health</a>
          <a href="#services">Services</a>
        </div>

        {loggedInUser ? (
  <div className="user-menu">
    <span>Welcome, {loggedInUser.name}</span>
    <button
  className="login-btn"
  onClick={() => {
    localStorage.removeItem("agritech_user");
    setLoggedInUser(null);
    window.location.href = "/login";
  }}
>
  Logout
</button>
  </div>
) : (
  <button
    className="login-btn"
    onClick={() => {
      window.location.href = "/login";
    }}
  >
    Login
  </button>
)}
      </nav>

      <p className="backend-status">
        Backend Status: {apiStatus}
      </p>

      <main>
        {/* Hero */}
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">SMART FARMING. BETTER FUTURE.</p>
            <h1>Grow smarter.<br />Harvest better.</h1>
            <p className="hero-text">
              Empowering farmers with useful agricultural information,
              crop guidance, live weather and digital farming solutions.
            </p>
            <a className="primary-btn" href="#crops">
              Explore Solutions →
            </a>
          </div>
        </section>

        {/* Introduction */}
        <section className="intro" id="features">
          <p className="eyebrow">WELCOME TO AGRITECH</p>
          <h2>Technology for every farmer</h2>
          <p>
            Make informed farming decisions with crop information,
            weather updates and farm resources in one place.
          </p>
        </section>

        {/* Crops */}
        <section className="crop-section" id="crops">
          <div className="crop-heading">
            <p className="eyebrow">GROW WITH CONFIDENCE</p>
            <h2>Explore Crops</h2>
            <p>Learn about crop seasons, soil and water requirements.</p>
          </div>

          {cropError && <p className="error-message">{cropError}</p>}

          {!cropError && crops.length === 0 && (
            <p>Loading crops...</p>
          )}

          <div className="crop-grid">
            {crops.map((crop) => (
              <article className="feature-card crop-card" key={crop.id}>
                <span className="crop-icon">{crop.icon || '🌱'}</span>
                <h3>{crop.name}</h3>
                <p><strong>Season:</strong> {crop.season}</p>
                <p><strong>Soil:</strong> {crop.soil}</p>
                <p><strong>Water:</strong> {crop.water}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Crop Recommendation */}
<section className="recommend-section" id="recommend">
  <div className="recommend-heading">
    <p className="eyebrow">SMART FARMING ASSISTANT</p>
    <h2>AI Crop Recommendation</h2>
    <p>
      Enter your farming conditions to find crops that may be suitable.
    </p>
  </div>

  <form className="recommend-form" onSubmit={recommendCrops}>
    <div className="form-group">
      <label htmlFor="soilType">Soil Type</label>
      <select
        id="soilType"
        value={soilType}
        onChange={(event) => setSoilType(event.target.value)}
      >
        <option value="Loamy">Loamy Soil</option>
        <option value="Clayey">Clayey Soil</option>
        <option value="Black">Black Soil</option>
        <option value="Sandy">Sandy Soil</option>
      </select>
    </div>

    <div className="form-group">
      <label htmlFor="season">Growing Season</label>
      <select
        id="season"
        value={season}
        onChange={(event) => setSeason(event.target.value)}
      >
        <option value="Kharif">Kharif</option>
        <option value="Rabi">Rabi</option>
      </select>
    </div>

    <div className="form-group">
      <label htmlFor="temperature">Temperature (°C)</label>
      <input
        id="temperature"
        type="number"
        min="-10"
        max="60"
        step="0.1"
        value={temperature}
        onChange={(event) => setTemperature(event.target.value)}
        required
      />
    </div>

    <div className="form-group">
      <label htmlFor="rainfall">Rainfall (mm)</label>
      <input
        id="rainfall"
        type="number"
        min="0"
        max="5000"
        step="1"
        value={rainfall}
        onChange={(event) => setRainfall(event.target.value)}
        required
      />
      <small>Enter the rainfall estimate for your growing period.</small>
    </div>

    <button className="recommend-btn" type="submit">
      🌱 Recommend Crops
    </button>
  </form>

  {recommendationMessage && (
    <p className="recommend-message" aria-live="polite">
      {recommendationMessage}
    </p>
  )}

  {recommendations.length > 0 && (
    <div className="recommend-grid">
      {recommendations.map((crop) => (
        <article className="recommend-card" key={crop.name}>
          <span className="recommend-icon">{crop.icon}</span>
          <h3>{crop.name}</h3>

          <div className="match-score">
            Condition match: {Math.round((crop.score / 8) * 100)}%
          </div>

          <p>{crop.reason}</p>
          <p><strong>Suitable season:</strong> {crop.seasons.join(', ')}</p>
          <p><strong>Compatible soil:</strong> {crop.soils.join(', ')}</p>
        </article>
      ))}
    </div>
  )}
</section>

        {/* Weather Dashboard */}
        <section className="weather-section" id="weather">
          <div className="weather-heading">
            <p className="eyebrow">WEATHER FOR SMART FARMING</p>
            <h2>Live Weather Dashboard</h2>
            <p>Check current weather conditions for your city.</p>
          </div>

          <form
            className="weather-search"
            onSubmit={(event) => {
              event.preventDefault();
              fetchWeather(searchCity);
            }}
          >
            <input
              type="text"
              value={searchCity}
              onChange={(event) => setSearchCity(event.target.value)}
              placeholder="Enter city, e.g. Indore"
              aria-label="Search city"
            />

            <button type="submit" disabled={weatherLoading}>
              {weatherLoading ? 'Searching...' : 'Search'}
            </button>

            <button
              type="button"
              className="refresh-btn"
              onClick={() => fetchWeather(city)}
              disabled={weatherLoading}
              aria-label="Refresh weather"
              title="Refresh weather"
            >
              ↻
            </button>
          </form>

          {weatherLoading && (
            <p className="weather-message">Loading weather data...</p>
          )}

          {weatherError && (
            <p className="error-message weather-message">
              {weatherError}
            </p>
          )}

          {weather && !weatherError && (
            <div className="weather-dashboard">
              <div className="weather-main-card">
                <div>
                  <p className="weather-location">📍 {weather.city}</p>
                  <h3 className="weather-temperature">
                    {Math.round(weather.temperature)}°C
                  </h3>
                  <p className="weather-condition">
                    {weather.condition}
                  </p>
                  <p className="feels-like">
                    Feels like {Math.round(weather.feelsLike)}°C
                  </p>
                </div>

                {weather.icon && (
                  <img
                    className="weather-icon"
                    src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                    alt={weather.condition}
                  />
                )}
              </div>

              <div className="weather-metrics">
                <article className="weather-metric">
                  <span>💧</span>
                  <p>Humidity</p>
                  <h3>{weather.humidity}%</h3>
                </article>

                <article className="weather-metric">
                  <span>💨</span>
                  <p>Wind Speed</p>
                  <h3>{weather.windSpeed} m/s</h3>
                </article>

                <article className="weather-metric">
                  <span>🌧️</span>
                  <p>Rainfall</p>
                  <h3>{weather.rainfall} mm</h3>
                  <small>Last hour</small>
                </article>
              </div>

              <p className="weather-note">
                Weather data is provided by OpenWeather.
                Conditions may change throughout the day.
              </p>
            </div>
          )}
        </section>

        {/* Soil Health Analyzer */}
<section className="soil-section" id="soil-health">
  <div className="soil-heading">
    <p className="eyebrow">UNDERSTAND YOUR SOIL</p>
    <h2>Soil Health Analyzer</h2>
    <p>Enter your soil test values to view basic soil-condition guidance.</p>
  </div>

  <form className="soil-form" onSubmit={analyzeSoil}>
    <div className="form-group">
      <label htmlFor="soilPH">Soil pH (0–14)</label>
      <input
        id="soilPH"
        type="number"
        min="0"
        max="14"
        step="0.1"
        value={soilPH}
        onChange={(event) => setSoilPH(event.target.value)}
        required
      />
    </div>

    <div className="form-group">
      <label htmlFor="nitrogen">Nitrogen (N)</label>
      <input
        id="nitrogen"
        type="number"
        min="0"
        max="1000"
        value={nitrogen}
        onChange={(event) => setNitrogen(event.target.value)}
        required
      />
    </div>

    <div className="form-group">
      <label htmlFor="phosphorus">Phosphorus (P)</label>
      <input
        id="phosphorus"
        type="number"
        min="0"
        max="1000"
        value={phosphorus}
        onChange={(event) => setPhosphorus(event.target.value)}
        required
      />
    </div>

    <div className="form-group">
      <label htmlFor="potassium">Potassium (K)</label>
      <input
        id="potassium"
        type="number"
        min="0"
        max="1000"
        value={potassium}
        onChange={(event) => setPotassium(event.target.value)}
        required
      />
    </div>

    <button className="recommend-btn" type="submit">
      Analyze Soil
    </button>
  </form>

  {soilError && (
    <p className="error-message soil-message">{soilError}</p>
  )}

  {soilAnalysis && (
    <div className="soil-results">
      <h3>Soil Analysis Results</h3>

      <article className="soil-result-card">
        <h4>Soil pH: {soilAnalysis.ph}</h4>
        <p>{soilAnalysis.phMessage}</p>
      </article>

      <article className="soil-result-card">
        <h4>Nutrient Values</h4>
        {soilAnalysis.nutrientMessage.map((message) => (
          <p key={message}>{message}</p>
        ))}
      </article>

      <p className="soil-disclaimer">
        These are basic rule-based observations, not a laboratory diagnosis.
        Nutrient interpretation requires measurement units and local soil-test
        reference ranges. Consult a soil testing laboratory before applying
        fertilizers or soil amendments.
      </p>
    </div>
  )}
</section>

          {/* 5-Day Forecast */}
          <div className="forecast-section">
            <div className="forecast-heading">
              <h3>5-Day Weather Forecast</h3>
              <p>Upcoming weather for {city}</p>
            </div>

            {forecastLoading && (
              <p className="weather-message">Loading forecast...</p>
            )}

            {forecastError && (
              <p className="error-message weather-message">
                {forecastError}
              </p>
            )}

            {!forecastLoading && !forecastError && forecast.length > 0 && (
              <div className="forecast-grid">
                {forecast.map((day) => (
                  <article className="forecast-card" key={day.date}>
                    <h4>
                      {new Date(`${day.date}T12:00:00`).toLocaleDateString(
                        'en-IN',
                        { weekday: 'short', day: 'numeric', month: 'short' }
                      )}
                    </h4>

                    {day.icon && (
                      <img
                        src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                        alt={day.condition}
                      />
                    )}

                    <h3>{Math.round(day.temperature)}°C</h3>
                    <p className="forecast-condition">{day.condition}</p>
                    <p>💧 {day.humidity}% humidity</p>
                    <p>💨 {day.windSpeed} m/s wind</p>
                  </article>
                ))}
              </div>
            )}

            {!forecastLoading && !forecastError && forecast.length === 0 && (
              <p className="weather-message">
                No forecast data available yet.
              </p>
            )}
          </div>


        {/* Services */}
        <section className="intro" id="services">
          <p className="eyebrow">OUR SERVICES</p>
          <h2>Solutions for modern farming</h2>
        </section>

        <section className="features">
          <article className="feature-card">
            <span>🌾</span>
            <h3>Crop Information</h3>
            <p>Explore crops and learn about growing conditions.</p>
          </article>

          <article className="feature-card">
            <span>🌦️</span>
            <h3>Weather Updates</h3>
            <p>Check current weather before planning farm activities.</p>
          </article>

          <article className="feature-card">
            <span>🛒</span>
            <h3>Farm Products</h3>
            <p>Browse agricultural products and supplies.</p>
          </article>
        </section>
      </main>
      <Marketplace />

      <footer>
        <p>© 2026 AgriTech | Empowering Farmers Through Technology</p>
      </footer>
    </div>
  );
}

export default App;