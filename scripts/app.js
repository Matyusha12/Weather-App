const API_KEY = '06071430f069356a80e6bd0df9f246d0';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/';

// DOM Elements
const searchBar = document.getElementById('search-bar');
const searchButton = document.getElementById('search-button');
const locationElement = document.getElementById('location');
const tempElement = document.getElementById('temp');
const descriptionElement = document.getElementById('description');
const forecastCards = document.getElementById('forecast-cards');
const currentIcon = document.getElementById('current-icon');
const historyContainer = document.getElementById('history-container'); 

// Fetch current weather
async function fetchWeather(city) {
    const url = `${API_BASE_URL}weather?q=${city}&appid=${API_KEY}&units=metric`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data = await response.json();
        updateCurrentWeather(data);
        saveCityToHistory(city); 
    } catch (error) {
        console.error('Failed to fetch weather data:', error);
        showError('Error loading current weather');
    }
}

// Fetch 7-day forecast
async function fetchForecast(city) {
    const url = `${API_BASE_URL}forecast?q=${city}&appid=${API_KEY}&units=metric`;
    try {
        const response = await fetch(url);
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
    if (!data || !data.main || !data.weather) {
        showError('Invalid weather data received');
        return;
    }

    const icon = data.weather[0].icon;
    locationElement.textContent = data.name;
    tempElement.innerHTML = `${Math.round(data.main.temp)}°C`;
    descriptionElement.textContent = capitalizeFirstLetter(data.weather[0].description);
    currentIcon.src = `https://openweathermap.org/img/wn/${icon}.png`;
    currentIcon.style.display = 'inline';
}

// Update 7-day forecast
function updateForecast(forecast) {
    if (!forecast || !Array.isArray(forecast)) {
        forecastCards.innerHTML = '<p>Invalid forecast data</p>';
        return;
    }

    forecastCards.innerHTML = ''; 
    forecast.slice(0, 7).forEach(day => {
        const icon = day.weather[0].icon;
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <h3>${new Date(day.dt_txt).toLocaleDateString()}</h3>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon">
            <p>${Math.round(day.main.temp)}°C</p>
            <p>${capitalizeFirstLetter(day.weather[0].description)}</p>
        `;
        forecastCards.appendChild(card);
    });
}

// Save city to history
function saveCityToHistory(city) {
    const cities = JSON.parse(localStorage.getItem('weatherCities')) || [];
    if (!cities.includes(city)) {
        cities.push(city);
        localStorage.setItem('weatherCities', JSON.stringify(cities));
        updateHistory(); 
    }
}

// Update saved cities display
function updateHistory() {
    const cities = JSON.parse(localStorage.getItem('weatherCities')) || [];
    historyContainer.innerHTML = ''; 
    cities.forEach(city => {
        const cityButton = document.createElement('button');
        cityButton.textContent = city;
        cityButton.className = 'history-button';
        cityButton.addEventListener('click', () => {
            fetchWeather(city);
            fetchForecast(city);
        });
        historyContainer.appendChild(cityButton);
    });
}

// Show error
function showError(message) {
    locationElement.textContent = message;
    tempElement.textContent = '--°C';
    descriptionElement.textContent = 'N/A';
    currentIcon.style.display = 'none';
}


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

searchButton.addEventListener('click', () => {
    const city = searchBar.value.trim();
    if (city) {
        fetchWeather(city);
        fetchForecast(city);
    } else {
        showError('Please enter a valid city name');
    }
});

// Fetch default weather on load
fetchWeather('New York');
fetchForecast('New York');
updateHistory(); 