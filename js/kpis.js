// Global reference to all data
let netflixData = [];

// Load data and initialize KPIs + Filters
d3.csv("data/netflix_titles.csv").then(data => {
    // Clean and parse data
    data.forEach(d => {
        d.release_year = +d.release_year;
        d.country = d.country || "Unknown";
        d.listed_in = d.listed_in || "Unknown";
    });

    netflixData = data;

    // Populate year dropdown
    const years = Array.from(new Set(data.map(d => d.release_year))).sort((a, b) => b - a);
    years.forEach(year => {
        d3.select("#yearFilter")
            .append("option")
            .attr("value", year)
            .text(year);
    });

    // Populate country dropdown
    const countrySet = new Set();
    data.forEach(d => {
        d.country.split(",").forEach(c => {
            countrySet.add(c.trim());
        });
    });
    const sortedCountries = Array.from(countrySet).sort();
    sortedCountries.forEach(country => {
        d3.select("#countryFilter")
            .append("option")
            .attr("value", country)
            .text(country);
    });

    // Initial render
    updateDashboard("All", "All");

    // Listeners
    d3.select("#yearFilter").on("change", function () {
        const selectedYear = this.value;
        const selectedCountry = d3.select("#countryFilter").property("value");
        updateDashboard(selectedYear, selectedCountry);
    });

    d3.select("#countryFilter").on("change", function () {
        const selectedCountry = this.value;
        const selectedYear = d3.select("#yearFilter").property("value");
        updateDashboard(selectedYear, selectedCountry);
    });
});

function updateDashboard(year, country) {
    // Apply both filters
    let filtered = netflixData;

    if (year !== "All") {
        filtered = filtered.filter(d => d.release_year === +year);
    }

    if (country !== "All") {
        filtered = filtered.filter(d =>
            d.country.split(",").map(c => c.trim()).includes(country)
        );
    }

    renderKPIs(filtered);

    // Charts affected by BOTH year and country filters
    if (typeof updatePieChart === 'function') updatePieChart(filtered);
    if (typeof updateDonutChart === 'function') updateDonutChart(filtered);
    if (typeof updateTreemap === 'function') updateTreemap(filtered);

    // Charts affected by YEAR ONLY
    const yearFiltered = year === "All"
        ? netflixData
        : netflixData.filter(d => d.release_year === +year);

    if (typeof updateBarCountry === 'function') updateBarCountry(yearFiltered);
    if (typeof updateBarDirector === 'function') updateBarDirector(yearFiltered);
    if (typeof updateHistogram === 'function') updateHistogram(yearFiltered);
}

function renderKPIs(data) {
    const total = data.length;
    const movies = data.filter(d => d.type === "Movie").length;
    const shows = data.filter(d => d.type === "TV Show").length;

    const countrySet = new Set();
    data.forEach(d => {
        d.country.split(',').forEach(c => countrySet.add(c.trim()));
    });

    const genreSet = new Set();
    data.forEach(d => {
        d.listed_in.split(',').forEach(g => genreSet.add(g.trim()));
    });

    const kpiHTML = `
        <div class="kpi-card">
            <h2>${total}</h2>
            <p>Total Titles</p>
        </div>
        <div class="kpi-card">
            <h2>${movies}</h2>
            <p>Movies</p>
        </div>
        <div class="kpi-card">
            <h2>${shows}</h2>
            <p>TV Shows</p>
        </div>
        <div class="kpi-card">
            <h2>${countrySet.size}</h2>
            <p>Unique Countries</p>
        </div>
        <div class="kpi-card">
            <h2>${genreSet.size}</h2>
            <p>Unique Genres</p>
        </div>
    `;

    d3.select("#kpiSection").html(kpiHTML);
}
