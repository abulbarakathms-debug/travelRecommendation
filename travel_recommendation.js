const searchInput = document.getElementById("searchInput");
const btnSearch = document.getElementById("btnSearch");
const btnClear = document.getElementById("btnClear");
const resultsDiv = document.getElementById("results");

// Returns the current local time for a time zone, e.g. "10:42:05 AM"
function localTime(timeZone) {
    if (!timeZone) return "";
    const options = { timeZone: timeZone, hour12: true, hour: "numeric", minute: "numeric", second: "numeric" };
    return new Date().toLocaleTimeString("en-US", options);
}

// Builds one recommendation card
function createCard(place, timeZone) {
    const card = document.createElement("div");
    card.className = "card";
    const time = localTime(timeZone);
    card.innerHTML = `
        <img src="${place.imageUrl}" alt="${place.name}">
        <div class="card-body">
            <h3>${place.name}</h3>
            ${time ? `<p class="time">Current local time: ${time}</p>` : ""}
            <p>${place.description}</p>
            <button class="btn-visit">Visit</button>
        </div>`;
    return card;
}

function showMessage(text) {
    resultsDiv.innerHTML = `<p class="no-results">${text}</p>`;
}

// Searches the JSON data for beaches, temples or a country
function searchRecommendations() {
    const keyword = searchInput.value.trim().toLowerCase();
    resultsDiv.innerHTML = "";

    if (keyword === "") {
        showMessage("Please enter a keyword such as beach, temple or a country name.");
        return;
    }

    fetch("travel_recommendation_api.json")
        .then(response => response.json())
        .then(data => {
            let places = [];

            if (keyword === "beach" || keyword === "beaches") {
                places = data.beaches.map(b => ({ place: b, tz: b.timeZone }));
            } else if (keyword === "temple" || keyword === "temples") {
                places = data.temples.map(t => ({ place: t, tz: t.timeZone }));
            } else if (keyword === "country" || keyword === "countries") {
                data.countries.forEach(c => c.cities.forEach(city => places.push({ place: city, tz: c.timeZone })));
            } else {
                const country = data.countries.find(c => c.name.toLowerCase() === keyword);
                if (country) {
                    places = country.cities.map(city => ({ place: city, tz: country.timeZone }));
                }
            }

            if (places.length === 0) {
                showMessage(`No recommendations found for "${searchInput.value}". Try beach, temple, Australia, Japan or Brazil.`);
                return;
            }

            places.forEach(item => resultsDiv.appendChild(createCard(item.place, item.tz)));
        })
        .catch(error => {
            console.error("Error fetching recommendations:", error);
            showMessage("Sorry, recommendations could not be loaded right now.");
        });
}

// Clears the search box and the results
function clearResults() {
    searchInput.value = "";
    resultsDiv.innerHTML = "";
}

btnSearch.addEventListener("click", searchRecommendations);
btnClear.addEventListener("click", clearResults);
searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") searchRecommendations();
});
