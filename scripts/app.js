const API_KEY = '06071430f069356a80e6bd0df9f246d0';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/';

// DOM Elements
const searchBar = document.getElementById('search-bar');
const searchButton = document.getElementById('search-button');
const locationElement = document.getElementById('location');
const tempElement = document.getElementById('temp');
const descriptionElement = document.getElementById('description');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const forecastCards = document.getElementById('forecast-cards');
const currentIcon = document.getElementById('current-icon');
const historyContainer = document.getElementById('history-container');
const spinner = document.getElementById('loading-spinner');

// Fetch Weather
async function fetchWeather(city) {
    toggleSpinner(true);
    try {
        const response = await fetch(`${API_BASE_URL}weather?q=${city}&appid=${API_KEY}&units=metric`);
        if (!response.ok) throw new Error('Weather fetch failed');
        const data = await response.json();
        updateCurrentWeather(data);
        saveCity(city);
    } catch (error) {
        console.error('Failed to fetch weather data:', error);
        showError('Error loading current weather');
    } finally {
        toggleSpinner(false);
    }
}

// Fetch Forecast
async function fetchForecast(city) {
    try {
        const response = await fetch(`${API_BASE_URL}forecast?q=${city}&appid=${API_KEY}&units=metric`);
        if (!response.ok) throw new Error('Forecast fetch failed');
        const data = await response.json();
        updateForecast(data.list);
    } catch (error) {
        console.error('Failed to fetch forecast data:', error);
    }
}

// Update Current Weather
function updateCurrentWeather(data) {
    if (!data || !data.main || !data.weather) {
        showError('Invalid weather data received');
        return;
    }

    const icon = data.weather[0].icon; 
    locationElement.textContent = data.name;
    tempElement.textContent = `${Math.round(data.main.temp)}°C`;
    descriptionElement.textContent = capitalizeFirstLetter(data.weather[0].description);
    humidityElement.textContent = `Humidity: ${data.main.humidity}%`;
    windSpeedElement.textContent = `Wind Speed: ${data.wind.speed} m/s`;
    currentIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`; 
    currentIcon.style.display = 'inline'; 
}

// Update Forecast
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
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather Icon">
            <p>${Math.round(day.main.temp)}°C</p>
            <p>${capitalizeFirstLetter(day.weather[0].description)}</p>
        `;
        forecastCards.appendChild(card);
    });
}

// Save City
function saveCity(city) {
    let cities = JSON.parse(localStorage.getItem('weatherCities')) || [];
    if (!cities.includes(city)) {
        cities.push(city);
        localStorage.setItem('weatherCities', JSON.stringify(cities));
        updateHistory();
    }
}

// Update History
function updateHistory() {
    const cities = JSON.parse(localStorage.getItem('weatherCities')) || [];
    historyContainer.innerHTML = ''; 
    cities.forEach(city => {
        const button = document.createElement('button');
        button.textContent = city;
        button.className = 'history-button';
        button.addEventListener('click', () => {
            fetchWeather(city);
            fetchForecast(city);
        });
        historyContainer.appendChild(button);
    });
}

// Show Error
function showError(message) {
    locationElement.textContent = message;
    tempElement.textContent = '--°C';
    descriptionElement.textContent = 'N/A';
    humidityElement.textContent = 'Humidity: --%';
    windSpeedElement.textContent = 'Wind Speed: -- m/s';
    currentIcon.style.display = 'none'; 
}

// Toggle Spinner
function toggleSpinner(show) {
    spinner.style.display = show ? 'block' : 'none';
}

// Capitalize First Letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize
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