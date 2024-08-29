// Define constants for API keys and base URLs
const weatherbitApiKey = '764cca6dce2442f1b9c490d1259af75b';
const geoNamesBaseURL = 'http://api.geonames.org/searchJSON?q=';
const weatherbitURL = 'http://api.weatherbit.io/v2.0/current';  // Weatherbit API base URL
const geoNamesUsername = 'hananzatar';
const pixabayApiKey = '45693229-f2e2586a5a5af9b19fd434fc0';
const pixabayBaseURL = 'https://pixabay.com/api/';
const restCountriesApiURL = 'https://restcountries.com/v3.1/name/';

export let lastAddedCity = ''; // Store the last added city
// In your app.js
export let destinations = []; // Export destinations for testing

export function addDestination(city, date) {
    const currentDate = new Date();
    const tripDate = new Date(date);

    if (tripDate < currentDate.setHours(0, 0, 0, 0)) {
        alert('Cannot select a past date!');
        return;
    }

    destinations.push({ city, date });
    lastAddedCity = city;

    updateDestinationList();
}


export async function getTripInfo(city) {
    try {
        // Fetch data from GeoNames API
        const geonamesResponse = await fetch(`${geoNamesBaseURL}${city}&maxRows=1&username=${geoNamesUsername}`);
        const geonamesData = await geonamesResponse.json();
        console.log('GeoNames Data:', geonamesData); // Debugging output

        if (!geonamesData.geonames || geonamesData.geonames.length === 0) {
            throw new Error('No data found in GeoNames API response.');
        }

        const country = geonamesData.geonames[0]?.countryName || "Country not found";
        const latitude = geonamesData.geonames[0]?.lat;
        const longitude = geonamesData.geonames[0]?.lng;

        // Fetch time using WorldTimeAPI based on the city's latitude and longitude
        let time = "Timezone not found";
        try {
            const timeResponse = await fetch(`http://worldtimeapi.org/api/timezone/Etc/GMT`);
            const timeData = await timeResponse.json();
            time = timeData.datetime ? new Date(timeData.datetime).toLocaleTimeString('en-US', { timeZone: timeData.timezone }) : "Time not found";
        } catch (error) {
            console.error('Error fetching time from WorldTimeAPI:', error);
        }

        // Fetch continent data from REST Countries API
        let continent = "Continent not found";
        try {
            const continentResponse = await fetch(`${restCountriesApiURL}${country}`);
            const continentData = await continentResponse.json();
            continent = continentData[0]?.region || "Continent not found";
        } catch (error) {
            console.error('Error fetching continent:', error);
        }

        // Fetch weather data from Weatherbit API
        const weatherResponse = await fetch(`${weatherbitURL}?city=${city}&key=${weatherbitApiKey}&units=metric`);
        const weatherData = await weatherResponse.json();

        // Fetch image data from Pixabay API
        const pixabayResponse = await fetch(`${pixabayBaseURL}?key=${pixabayApiKey}&q=${city}&image_type=photo`);
        const pixabayData = await pixabayResponse.json();

        const tripInfo = {
            time: time,
            continent: continent,
            country: country,
            latitude: latitude,
            longitude: longitude,
            weather: `${weatherData.data[0]?.weather?.description || "Weather data not found"}, ${weatherData.data[0]?.temp || "Temperature data not found"}°C`,
            imageUrl: pixabayData.hits[0] ? pixabayData.hits[0].webformatURL : 'default_image_url.jpg', // Fallback if no image is found
        };

        updateTripInfoUI(tripInfo);
    } catch (error) {
        console.error('Error fetching trip info:', error);
        document.getElementById('trip-info').innerHTML = `<div>Error retrieving trip information: ${error.message}</div>`;
    }
}

function updateTripInfoUI(tripInfo) {
    const tripInfoContainer = document.getElementById('trip-info');
    tripInfoContainer.innerHTML = ''; // Clear the previous list

    const tripInfoHtml = `
        <div>
            <strong>Continent:</strong> ${tripInfo.continent}<br>
            <strong>Country:</strong> ${tripInfo.country}<br>
            <strong>Latitude:</strong> ${tripInfo.latitude}<br>
            <strong>Longitude:</strong> ${tripInfo.longitude}<br>
            <strong>Weather:</strong> ${tripInfo.weather}<br>
            <img src="${tripInfo.imageUrl}" alt="Image of the city" style="width: 100%; max-width: 300px;">
        </div>
    `;

    tripInfoContainer.innerHTML = tripInfoHtml;
}

export function updateDestinationList() {
    const tripList = document.getElementById('trip-list');
    tripList.innerHTML = ''; // Clear the previous list

    const currentDate = new Date();

    destinations.forEach((destination, index) => {
        const tripDate = new Date(destination.date);
        const isExpired = tripDate < currentDate.setHours(0, 0, 0, 0);
        const isCurrentDate = tripDate.toDateString() === currentDate.toDateString();

        const destinationItem = document.createElement('div');
        destinationItem.classList.add('destination-item');

        const destinationText = `
            <strong ${isCurrentDate || isExpired ? 'style="text-decoration: line-through; color: red;"' : ''}>
            ${destination.city} - Trip Date: ${destination.date}</strong>`;

        destinationItem.innerHTML = `
            ${destinationText}
            <button onclick="removeDestination(${index})">Remove</button>
            <button onclick="modifyDestination(${index})">Modify</button>
        `;

        tripList.appendChild(destinationItem);
    });
}

export function removeDestination(index) {
    destinations.splice(index, 1); // Remove the selected destination
    updateDestinationList(); // Refresh the destination list
}

export function modifyDestination(index) {
    const newDate = prompt("Enter new trip date (yyyy-mm-dd):");
    if (newDate) {
        const tripDate = new Date(newDate);
        const currentDate = new Date();

        // Prevent modifying to a past date
        if (tripDate < currentDate.setHours(0, 0, 0, 0)) {
            alert('Cannot select a past date!');
            return;
        }

        destinations[index].date = newDate; // Update the date
        updateDestinationList(); // Refresh the destination list
    }
}

export function getLastAddedCity() {
    return lastAddedCity;
}

// Event listeners setup
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-destination').addEventListener('click', () => {
        const city = document.getElementById('city').value;
        const date = document.getElementById('date-input').value;
        if (city && date) {
            addDestination(city, date);
            document.getElementById('city').value = '';
            document.getElementById('date-input').value = '';
        }
    });

    document.getElementById('generate-trip-info').addEventListener('click', () => {
        if (lastAddedCity) {
            getTripInfo(lastAddedCity);
        } else {
            alert('No destination has been added yet!');
        }
    });
});

// Make sure to expose these functions globally so they can be called from the inline event handlers
window.removeDestination = removeDestination;
window.modifyDestination = modifyDestination;
