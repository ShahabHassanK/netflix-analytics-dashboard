// Global reference to all data
let netflixData = [];

// Load data and initialize KPIs
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

    // Initial render
    updateDashboard("All");

    // Listen to filter change
    d3.select("#yearFilter").on("change", function () {
        const selectedYear = this.value;
        updateDashboard(selectedYear);
    });
});

function updateDashboard(year) {
    let filtered = year === "All"
        ? netflixData
        : netflixData.filter(d => d.release_year === +year);

    renderKPIs(filtered);

    // Trigger chart updates here later
    if (typeof updatePieChart === 'function') updatePieChart(filtered);
    if (typeof updateBarCountry === 'function') updateBarCountry(filtered);
    if (typeof updateBarDirector === 'function') updateBarDirector(filtered);
    if (typeof updateHistogram === 'function') updateHistogram(filtered);
    if (typeof updateDonutChart === 'function') updateDonutChart(filtered);
    if (typeof updateTreemap === 'function') updateTreemap(filtered);
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
