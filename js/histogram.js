let histogramSvg, histogramTooltip;
let histogramWidth = 700;
let histogramHeight = 450;
let histogramMargin = { top: 60, right: 30, bottom: 40, left: 60 };
let histogramInnerWidth = histogramWidth - histogramMargin.left - histogramMargin.right;
let histogramInnerHeight = histogramHeight - histogramMargin.top - histogramMargin.bottom;

function initHistogram(data) {
    const svg = d3.select("#histogram")
        .append("svg")
        .attr("width", histogramWidth)
        .attr("height", histogramHeight);

    // Title
    svg.append("text")
        .attr("x", histogramWidth / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-size", "20px")
        .text("Movie Duration Distribution");

    histogramSvg = svg.append("g")
        .attr("transform", `translate(${histogramMargin.left}, ${histogramMargin.top})`);

    // Tooltip
    histogramTooltip = d3.select("#histogram")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("opacity", 0);

    updateHistogram(data);
}

function updateHistogram(data) {
    // Filter only movies with numeric durations
    const durations = data
        .filter(d => d.type === "Movie" && d.duration && d.duration.includes("min"))
        .map(d => +d.duration.replace(" min", "").trim());

    if (durations.length === 0) {
        histogramSvg.selectAll("*").remove();
        return;
    }

    const x = d3.scaleLinear()
        .domain([0, d3.max(durations)])
        .range([0, histogramInnerWidth]);

    const bins = d3.bin()
        .domain(x.domain())
        .thresholds(15)(durations);

    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([histogramInnerHeight, 0]);

    // Clear previous chart
    histogramSvg.selectAll("*").remove();

    // X axis
    histogramSvg.append("g")
        .attr("transform", `translate(0, ${histogramInnerHeight})`)
        .call(d3.axisBottom(x).ticks(8))
        .selectAll("text")
        .style("fill", "#fff");

    // Y axis
    histogramSvg.append("g")
        .call(d3.axisLeft(y).ticks(6))
        .selectAll("text")
        .style("fill", "#fff");

    // Bars
    histogramSvg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", d => x(d.x0))
        .attr("y", d => y(d.length))
        .attr("width", d => x(d.x1) - x(d.x0) - 1)
        .attr("height", d => histogramInnerHeight - y(d.length))
        .attr("fill", "#e50914")
        .on("mouseover", function (event, d) {
            d3.select(this).attr("fill", "#ff4c4c");
            histogramTooltip
                .style("opacity", 1)
                .html(`<strong>${d.length}</strong> movies<br/>${d.x0}–${d.x1} min`)
                .style("left", `${event.layerX + 20}px`)
                .style("top", `${event.layerY - 20}px`);
        })
        .on("mousemove", function (event) {
            histogramTooltip
                .style("left", `${event.layerX + 20}px`)
                .style("top", `${event.layerY - 20}px`);
        })
        .on("mouseout", function () {
            d3.select(this).attr("fill", "#e50914");
            histogramTooltip.style("opacity", 0);
        });
}

// Initialize if data already available
if (typeof netflixData !== "undefined") {
    initHistogram(netflixData);
}
