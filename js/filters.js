// Utility function to get filtered data based on year and country
function getFilteredData(allData) {
    const selectedYear = d3.select("#yearFilter").property("value");
    const selectedCountry = d3.select("#countryFilter").property("value");

    let filtered = allData;

    if (selectedYear !== "All") {
        filtered = filtered.filter(d => d.release_year === +selectedYear);
    }

    if (selectedCountry !== "All") {
        filtered = filtered.filter(d =>
            d.country.split(",").map(c => c.trim()).includes(selectedCountry)
        );
    }

    return filtered;
}

// Utility: filter only by year (for charts that should not respond to country filter)
function getYearFilteredData(allData) {
    const selectedYear = d3.select("#yearFilter").property("value");

    if (selectedYear === "All") {
        return allData;
    } else {
        return allData.filter(d => d.release_year === +selectedYear);
    }
}

// Utility: filter only by country (in case needed separately)
function getCountryFilteredData(allData) {
    const selectedCountry = d3.select("#countryFilter").property("value");

    if (selectedCountry === "All") {
        return allData;
    } else {
        return allData.filter(d =>
            d.country.split(",").map(c => c.trim()).includes(selectedCountry)
        );
    }
}
