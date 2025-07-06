let barCountrySvg, barCountryTooltip;
let barCountryWidth = 700;
let barCountryHeight = 450;
let barCountryMargin = { top: 60, right: 120, bottom: 40, left: 150 };
let barCountryInnerWidth = barCountryWidth - barCountryMargin.left - barCountryMargin.right;
let barCountryInnerHeight = barCountryHeight - barCountryMargin.top - barCountryMargin.bottom;

function initBarCountry(data) {
    const svg = d3.select("#bar-country")
        .append("svg")
        .attr("width", barCountryWidth)
        .attr("height", barCountryHeight);

    // Title
    svg.append("text")
        .attr("x", barCountryWidth / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-size", "20px")
        .text("Top 10 Countries by Content Count");

    barCountrySvg = svg.append("g")
        .attr("transform", `translate(${barCountryMargin.left},${barCountryMargin.top})`);

    // Tooltip
    barCountryTooltip = d3.select("#bar-country")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("opacity", 0);

    updateBarCountry(data);
}

function updateBarCountry(data) {
    const countryCounts = {};

    data.forEach(d => {
        if (d.country) {
            d.country.split(",").forEach(country => {
                country = country.trim();
                countryCounts[country] = (countryCounts[country] || 0) + 1;
            });
        }
    });

    const topCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([country, count]) => ({ country, count }))
        .reverse();

    const x = d3.scaleLinear()
        .domain([0, d3.max(topCountries, d => d.count)])
        .range([0, barCountryInnerWidth]);

    const y = d3.scaleBand()
        .domain(topCountries.map(d => d.country))
        .range([barCountryInnerHeight, 0])
        .padding(0.1);

    // Clear
    barCountrySvg.selectAll("*").remove();

    // Axes
    barCountrySvg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("fill", "#fff")
        .style("font-size", "16px")
        .style("font-weight", "bold");

    barCountrySvg.append("g")
        .attr("transform", `translate(0,${barCountryInnerHeight})`)
        .call(d3.axisBottom(x).ticks(5))
        .selectAll("text")
        .style("fill", "#fff");

    // Bars
    barCountrySvg.selectAll(".bar")
        .data(topCountries)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.country))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", d => x(d.count))
        .attr("fill", "#e50914")
        .on("mouseover", function (event, d) {
            d3.select(this).attr("fill", "#ff4c4c");
            barCountryTooltip
                .style("opacity", 1)
                .html(`<strong>${d.country}</strong>: ${d.count} titles`)
                .style("left", `${event.layerX + 20}px`)
                .style("top", `${event.layerY - 20}px`);
        })
        .on("mousemove", function (event) {
            barCountryTooltip
                .style("left", `${event.layerX + 20}px`)
                .style("top", `${event.layerY - 20}px`);
        })
        .on("mouseout", function () {
            d3.select(this).attr("fill", "#e50914");
            barCountryTooltip.style("opacity", 0);
        });
}

if (typeof netflixData !== "undefined") {
    initBarCountry(netflixData);
}
