console.log("Fire Pit Finder is running!");

// Step 1: Define a sample fire pit
const firepits = [
  {
    name: "Kilchberg Mound",
    latitude: 47.32945528088963,
    longitude: 8.537313507864468,
    hasFreeWood: true,
    description: "Small oasis of forest on a hill"
  },
  {
    name: "Adliswil Schrebergarten",
    latitude: 47.30657476202636,
    longitude: 8.534030659381315,
    hasFreeWood: false,
    description: "Looks onto Adliswil and Zürich with triangle cooking grate"
  },
  {
    name: "Grillplatz Chopfholz",
    latitude: 47.304775157523174,
    longitude: 8.533922925896889,
    hasFreeWood: false,
    description: "Running water, two fire pit grills, more likely to be busy."
  }
];

// Step 2: Grab the container from the HTML
const container = document.getElementById("firepit-container");
console.log(container);

let selectedCard = null;
let selectedPit = null;
let map = null; // Will hold our Leaflet map
let markers = {}; // Store markers by fire pit name

// Step 3: Render the fire pit into the page
async function getWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,precipitation`;

    const response = await fetch(url);
    const data = await response.json();

    return data.current;
}

// ============================================
// MAP: Initialize the Map
// ============================================

function initializeMap() {
  // Calculate center point from all fire pits
  const avgLat = firepits.reduce((sum, pit) => sum + pit.latitude, 0) / firepits.length;
  const avgLon = firepits.reduce((sum, pit) => sum + pit.longitude, 0) / firepits.length;
  
  // Create the map centered on the average location
  // L is the global Leaflet object (comes from the library)
  map = L.map('map').setView([avgLat, avgLon], 13);
  
  // Add the tile layer (the actual map images)
  // This uses OpenStreetMap tiles (free!)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
  }).addTo(map);
  
  console.log("Map initialized at:", avgLat, avgLon);
}

// ============================================
// MAP: Add a Marker for a Fire Pit
// ============================================

function addMarkerForPit(pit, weatherData) {
    const marker = L.marker([pit.latitude, pit.longitude]).addTo(map);
    
    // Create popup content
    let popupContent = `<h3>${pit.name}</h3>`;
    popupContent += `<p>${pit.description}</p>`;
    popupContent += `<p>${pit.hasFreeWood ? "🔥 Free wood" : "🪵 Bring wood"}</p>`;
    
    if (weatherData) {
        const temp = weatherData.temperature_2m;
        const wind = weatherData.wind_speed_10m;
        const rain = weatherData.precipitation;
        
        popupContent += `<p>🌡️ ${temp}°C | 🌬️ ${wind} km/h | 🌧️ ${rain} mm</p>`;
        
        // Add recommendation
        let status = "";
        if (rain > 0.5 || wind > 20) {
            status = "🚫 Not suitable";
        } else if (wind > 10) {
            status = "⚠️ Borderline";
        } else {
            status = "🔥 Suitable";
        }
        popupContent += `<p><strong>${status}</strong></p>`;
    }
    
    marker.bindPopup(popupContent);
    
    // When marker is clicked, select the corresponding card
    marker.on('click', () => {
      selectFirepit(pit);
    });

    // Store the marker so we can access it later
    markers[pit.name] = marker;
    
    return marker;
}

// ============================================
// UI: Select a Fire Pit (works from card OR map)
// ============================================

function selectFirepit(pit) {
  // Find the corresponding card
  const cards = document.querySelectorAll('.firepit-card');
  cards.forEach(card => {
      if (card.dataset.pitName === pit.name) {
          // Remove previous selection
          if (selectedCard) {
              selectedCard.classList.remove("selected");
          }
          
          // Add new selection
          card.classList.add("selected");
          selectedCard = card;
          selectedPit = pit;
          
          // Scroll card into view
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          
          // Open the marker popup
          if (markers[pit.name]) {
              markers[pit.name].openPopup();
          }
          
          console.log("Selected:", pit.name);
      }
  });
}

// firepits.forEach(async pit => { //


async function renderFirepits() {
  const container = document.getElementById("firepit-container");
  
    // Initialize the map first
    initializeMap();

  for (const pit of firepits) {
    const card = document.createElement("div");
    card.className = "firepit-card";
    
    card.className = "firepit-card";
    card.dataset.pitName = pit.name; // Store name for easy lookup

    card.addEventListener("click", () => {
      selectFirepit(pit);
  });

    const title = document.createElement("h3");
    title.textContent = pit.name;

    const description = document.createElement("p");
    description.textContent = pit.description;

    const wood = document.createElement("p");
    wood.className = "wood";
    wood.textContent = pit.hasFreeWood ? "🔥 Free wood available" : "🪵 Bring your own wood";

    const weather = document.createElement("p");
    weather.className = "weather";
    weather.textContent = "⏳ Loading weather...";

    const recommendation = document.createElement("p");
    recommendation.className = "recommendation";
    recommendation.textContent = "";

    try {
        const current = await getWeather(pit.latitude, pit.longitude);

        const temp = current.temperature_2m;
        const wind = current.wind_speed_10m;
        const rain = current.precipitation;

        weather.textContent = `🌡️ ${temp}°C | 🌬️ ${wind} km/h | 🌧️ ${rain} mm`;

        let status = "";
        let cssClass = "";
        if (rain > 0.5 || wind > 20) {
            status = "🚫 Not suitable for a fire";
            cssClass = "bad";
        }   else if (wind > 10) {
            status = "⚠️ Borderline conditions";
            cssClass = "borderline";
          } else {
            status = "🔥 Suitable for a fire";
            cssClass = "good";
          }
        
        recommendation.textContent = status;
        recommendation.classList.remove("good", "borderline", "bad");
        recommendation.classList.add("recommendation", cssClass);
         // Update marker with weather data
         addMarkerForPit(pit, current);

    }   catch (error) {
        weather.textContent = "❌ Could not load weather";
        console.error(error);
    }

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(wood);
    card.appendChild(weather);
    card.appendChild(recommendation);

    container.appendChild(card);

     // Add marker to map (without weather data initially)
     addMarkerForPit(pit, null);
  }
};
renderFirepits();