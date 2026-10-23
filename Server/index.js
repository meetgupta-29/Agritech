require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware to allow frontend-backend connection
app.use(cors());

// Middleware to read JSON data
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("AgriTech Backend is running successfully!");
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "AgriTech API is working!"
  });
});

const crops = [
  {
    id: 1,
    name: "Wheat",
    season: "Rabi",
    soil: "Well-drained loamy soil",
    water: "Moderate",
    icon: "🌾"
  },
  {
    id: 2,
    name: "Rice",
    season: "Kharif",
    soil: "Clayey or loamy soil",
    water: "High",
    icon: "🌾"
  },
  {
    id: 3,
    name: "Maize",
    season: "Kharif",
    soil: "Well-drained loamy soil",
    water: "Moderate",
    icon: "🌽"
  },
  {
    id: 4,
    name: "Soybean",
    season: "Kharif",
    soil: "Well-drained soil",
    water: "Moderate",
    icon: "🫘"
  },
  {
    id: 5,
    name: "Mustard",
    season: "Rabi",
    soil: "Loamy soil",
    water: "Low to moderate",
    icon: "🌼"
  },
  {
    id: 6,
    name: "Cotton",
    season: "Kharif",
    soil: "Black soil",
    water: "Moderate",
    icon: "🌱"
  }
];

// API to get all crops
app.get("/api/crops", (req, res) => {
  res.json({
    success: true,
    count: crops.length,
    data: crops
  });
});
// Weather API
app.get("/api/weather", async (req, res) => {
  try {
    const city = req.query.city || "Indore";
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Weather API key is missing"
      });
    }

    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );

    const weatherData = await weatherResponse.json();

    if (!weatherResponse.ok) {
      return res.status(weatherResponse.status).json({
        success: false,
        message: weatherData.message || "Unable to fetch weather"
      });
    }

    res.json({
      success: true,
      city: weatherData.name,
      temperature: weatherData.main.temp,
      feelsLike: weatherData.main.feels_like,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed,
      condition: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      rainfall: weatherData.rain
        ? (weatherData.rain["1h"] || 0)
        : 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to connect to weather service"
    });
  }
});
app.get("/api/forecast", async (req, res) => {
  try {
    const city = req.query.city || "Indore";
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Weather API key is missing"
      });
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.message || "Unable to load forecast"
      });
    }

    // Select one forecast entry per day, around midday
    const dailyForecast = {};

    data.list.forEach((item) => {
      const date = item.dt_txt.split(" ")[0];
      const hour = Number(item.dt_txt.split(" ")[1].slice(0, 2));

      if (
        !dailyForecast[date] ||
        Math.abs(hour - 12) <
          Math.abs(dailyForecast[date].hour - 12)
      ) {
        dailyForecast[date] = {
          hour,
          date,
          temperature: item.main.temp,
          condition: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed
        };
      }
    });

    res.json({
      success: true,
      city: data.city.name,
      forecast: Object.values(dailyForecast).slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to connect to forecast service"
    });
  }
});
// Start server
app.listen(PORT, () => {
  console.log(`AgriTech server running at http://localhost:${PORT}`);
});