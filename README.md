🌱 AgriTech – Smart Agriculture Platform

📌 About the Project

AgriTech is a web-based smart agriculture platform designed to help farmers and users access useful agricultural information through a simple interface.

✨ Features

- Weather Dashboard: View current weather and a five-day forecast.
- Crop Recommendation: Get crop suggestions based on soil type, season, temperature, and rainfall.
- Soil Health Analyzer: Enter soil pH and NPK values to receive basic soil guidance.
- Marketplace: Browse sample agricultural products, search products, filter categories, and manage a shopping cart.
- User Authentication: Sign up and log in to an account.

🛠️ Technology Stack

- Frontend: React, Vite, CSS
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: JSON Web Tokens (JWT)
- Weather Data: OpenWeather API
- Version Control: Git and GitHub

📁 Project Structure

AgriTech/
├── Client/
│   └── src/
├── Server/
│   ├── index.js
│   └── .env
├── README.md
└── .gitignore

⚙️ Installation and Setup

1. Clone the repository

git clone YOUR_GITHUB_REPOSITORY_URL
cd AgriTech

2. Install backend dependencies

cd Server
npm install

3. Configure environment variables

Create a ".env" file inside the "Server" folder and add your own MongoDB connection string, JWT secret, and OpenWeather API key using the variable names expected by the backend code.

Never upload your ".env" file or expose API keys and secrets.

4. Start the backend

node index.js

5. Install and start the frontend

Open a second terminal:

cd Client
npm install
npm run dev

Open the local URL displayed by Vite in your terminal.

🔐 Security

- Keep credentials and API keys in environment variables.
- Ensure ".env" files are excluded from Git.
- Use strong secrets and rotate any credentials that have been exposed.

🚀 Future Improvements

- Connect the marketplace to a database.
- Add seller management and secure checkout.
- Improve crop recommendations with validated agricultural data or machine learning.
- Deploy the frontend and backend online.

👨‍💻 Author

Meet Gupta