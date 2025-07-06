// Utility function to get filtered data by year
function getFilteredData(allData) {
    const selectedYear = d3.select("#yearFilter").property("value");
    if (selectedYear === "All") {
        return allData;
    } else {
        return allData.filter(d => d.release_year === +selectedYear);
    }
}
