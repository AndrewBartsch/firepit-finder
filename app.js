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

// Step 3: Render the fire pit into the page
async function getWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,precipitation`;

    const response = await fetch(url);
    const data = await response.json();

    return data.current;
}

// firepits.forEach(async pit => { //


async function renderFirepits() {
  const container = document.getElementById("firepit-container");
  
  for (const pit of firepits) {
    const card = document.createElement("div");
    card.className = "firepit-card";

    card.addEventListener("click", () => {
        if (selectedCard) {
            selectedCard.classList.remove("selected");
        }

        card.classList.add("selected");
        selectedCard = card;
        selectedPit = pit;

        console.log("Selected:", pit.name, pit.latitude, pit.longitude);
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
  }
};
renderFirepits();