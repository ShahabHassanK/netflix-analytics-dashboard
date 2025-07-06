let pieChartSvg, pieChartG, pieChartArc, pieChartPie, pieChartColor, pieTooltip;

function initPieChart(data) {
    const width = 700;
    const height = 450;
    const radius = Math.min(width, height) / 2 - 50;

    pieChartColor = d3.scaleOrdinal()
        .domain(["Movie", "TV Show"])
        .range(["#e50914", "#2a4aff"]);

    // Create main SVG
    pieChartSvg = d3.select("#pie-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Title
    pieChartSvg.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-size", "20px")
        .text("Distribution of Movies vs TV Shows");

    // Group for pie chart
    pieChartG = pieChartSvg.append("g")
        .attr("transform", `translate(${width / 3}, ${height / 2 + 10})`);

    pieChartArc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    pieChartPie = d3.pie()
        .value(d => d.count)
        .sort(null);

    // Tooltip
    pieTooltip = d3.select("#pie-chart")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // Legend container
    pieChartSvg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width * 0.65}, ${height / 2 - 40})`);

    updatePieChart(data);
}

function updatePieChart(data) {
    const counts = d3.rollups(
        data,
        v => v.length,
        d => d.type
    ).map(([type, count]) => ({ type, count }));

    // PIE SLICES
    const arcs = pieChartG.selectAll("path").data(pieChartPie(counts), d => d.data.type);

    // ENTER
    arcs.enter()
        .append("path")
        .attr("d", pieChartArc)
        .attr("fill", d => pieChartColor(d.data.type))
        .attr("stroke", "#111")
        .attr("stroke-width", 2)
        .on("mouseover", function (event, d) {
            d3.select(this).attr("opacity", 0.7);
            pieTooltip
                .style("opacity", 1)
                .html(`<strong>${d.data.type}</strong>: ${d.data.count}`)
                .style("left", `${event.layerX + 20}px`)
                .style("top", `${event.layerY - 20}px`);
        })
        .on("mousemove", function (event) {
            pieTooltip
                .style("left", `${event.layerX + 20}px`)
                .style("top", `${event.layerY - 20}px`);
        })
        .on("mouseout", function () {
            d3.select(this).attr("opacity", 1);
            pieTooltip.style("opacity", 0);
        })
        .merge(arcs)
        .transition()
        .duration(750)
        .attr("d", pieChartArc)
        .attr("fill", d => pieChartColor(d.data.type));

    arcs.exit().remove();

    // LEGEND
    const legend = pieChartSvg.select(".legend")
        .selectAll("g")
        .data(counts, d => d.type);

    const legendEnter = legend.enter()
        .append("g")
        .attr("transform", (d, i) => `translate(0, ${i * 25})`);

    legendEnter.append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", d => pieChartColor(d.type));

    legendEnter.append("text")
        .attr("x", 24)
        .attr("y", 13)
        .style("fill", "#fff")
        .text(d => `${d.type} (${d.count})`);

    // Update
    legend.select("text").text(d => `${d.type} (${d.count})`);
    legend.select("rect").attr("fill", d => pieChartColor(d.type));

    legend.exit().remove();
}

// Initialize if data already available
if (typeof netflixData !== "undefined") {
    initPieChart(netflixData);
}
