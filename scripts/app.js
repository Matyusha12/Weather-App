const API_KEY = '38d263a46a2cfb33741303dfddfdeb43'; 
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather?'; 

// Get DOM elements
const searchBar = document.getElementById('search-bar');
const locationElement = document.getElementById('location');
const tempElement = document.getElementById('temp');
const descriptionElement = document.getElementById('description');
const forecastCards = document.getElementById('forecast-cards');

// Fetch weather data by city name
async function fetchWeather(city) {
    try {
        const response = await fetch(`${API_BASE_URL}weather?q=${city}&appid=${API_KEY}&units=metric`);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data = await response.json();
        updateCurrentWeather(data);
    } catch (error) {
        console.error('Failed to fetch weather data:', error);
        locationElement.textContent = 'Error loading weather data';
        tempElement.textContent = '--°C';
        descriptionElement.textContent = 'N/A';
    }
}

// Fetch 7-day forecast
async function fetchForecast(city) {
    try {
        const response = await fetch(`${API_BASE_URL}forecast?q=${city}&appid=${API_KEY}&units=metric`);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data = await response.json();
        updateForecast(data.list);
    } catch (error) {
        console.error('Failed to fetch forecast data:', error);
        forecastCards.innerHTML = '<p>Error loading forecast data</p>';
    }
}

// Update current weather
function updateCurrentWeather(data) {
    locationElement.textContent = data.name;
    tempElement.textContent = `${Math.round(data.main.temp)}°C`;
    descriptionElement.textContent = data.weather[0].description;
}

// Update 7-day forecast
function updateForecast(forecast) {
    forecastCards.innerHTML = '';
    forecast.slice(0, 7).forEach(day => {
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <h3>${new Date(day.dt_txt).toLocaleDateString()}</h3>
            <p>${Math.round(day.main.temp)}°C</p>
            <p>${day.weather[0].description}</p>
        `;
        forecastCards.appendChild(card);
    });
}

// Event listener for search bar
searchBar.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
        const city = searchBar.value.trim();
        fetchWeather(city);
        fetchForecast(city);
    }
});

// Fetch default location weather on load
fetchWeather('New York');
fetchForecast('New York');
