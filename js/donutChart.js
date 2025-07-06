let donutSvg, donutG, donutArc, donutPie, donutColor, donutTooltip;
const donutWidth = 700, donutHeight = 450;
const donutRadius = Math.min(donutWidth, donutHeight) / 2 - 40;

function initDonutChart(data) {
    // Updated Netflix-red inspired distinguishable colors
    donutColor = d3.scaleOrdinal()
        .range([
            "#e50914", // Netflix red
            "#1e3a8a", // Dark Blue
            "#065f46", // Dark Green
            "#6b21a8", // Purple
            "#d97706"  // Gold
        ]);

    const svg = d3.select("#donut-chart")
        .append("svg")
        .attr("width", donutWidth)
        .attr("height", donutHeight);

    // Title
    svg.append("text")
        .attr("x", donutWidth / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-size", "20px")
        .text("Top 5 Genres by Count");

    // Arc group
    donutG = svg.append("g")
        .attr("transform", `translate(${donutWidth / 3}, ${donutHeight / 2 + 10})`);

    donutArc = d3.arc()
        .innerRadius(donutRadius * 0.5)
        .outerRadius(donutRadius);

    donutPie = d3.pie()
        .value(d => d.count)
        .sort(null);

    // Tooltip
    donutTooltip = d3.select("#donut-chart")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // Legend group (slightly left)
    svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${donutWidth * 0.60}, ${donutHeight / 2 - 60})`);

    updateDonutChart(data);
}

function updateDonutChart(data) {
    // Genre aggregation
    const genreCounts = {};
    data.forEach(d => {
        if (d.listed_in) {
            d.listed_in.split(",").forEach(g => {
                const genre = g.trim();
                if (genre !== "") {
                    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
                }
            });
        }
    });

    const topGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([genre, count]) => ({ genre, count }));

    donutColor.domain(topGenres.map(d => d.genre)); // ensure matching

    const arcs = donutG.selectAll("path").data(donutPie(topGenres), d => d.data.genre);

    // ENTER
    arcs.enter()
        .append("path")
        .attr("d", donutArc)
        .attr("fill", d => donutColor(d.data.genre))
        .attr("stroke", "#111")
        .attr("stroke-width", 2)
        .on("mouseover", function (event, d) {
            d3.select(this).attr("opacity", 0.7);
            donutTooltip
                .style("opacity", 1)
                .html(`<strong>${d.data.genre}</strong>: ${d.data.count}`)
                .style("left", `${event.layerX + 20}px`)
                .style("top", `${event.layerY - 20}px`);
        })
        .on("mousemove", function (event) {
            donutTooltip
                .style("left", `${event.layerX + 20}px`)
                .style("top", `${event.layerY - 20}px`);
        })
        .on("mouseout", function () {
            d3.select(this).attr("opacity", 1);
            donutTooltip.style("opacity", 0);
        })
        .merge(arcs)
        .transition()
        .duration(750)
        .attr("d", donutArc)
        .attr("fill", d => donutColor(d.data.genre));

    arcs.exit().remove();

    // Legend
    const legend = d3.select("#donut-chart svg .legend")
        .selectAll("g")
        .data(topGenres, d => d.genre);

    const legendEnter = legend.enter()
        .append("g")
        .attr("transform", (d, i) => `translate(0, ${i * 25})`);

    legendEnter.append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", d => donutColor(d.genre));

    legendEnter.append("text")
        .attr("x", 24)
        .attr("y", 13)
        .style("fill", "#fff")
        .style("font-size", "13px")
        .text(d => `${d.genre} (${d.count})`);

    legend.select("text").text(d => `${d.genre} (${d.count})`);
    legend.select("rect").attr("fill", d => donutColor(d.genre));

    legend.exit().remove();
}

// Initialize if data ready
if (typeof netflixData !== "undefined") {
    initDonutChart(netflixData);
}
