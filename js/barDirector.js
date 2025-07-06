let barDirectorSvg, barDirectorTooltip;
let barDirectorWidth = 700;
let barDirectorHeight = 450;
let barDirectorMargin = { top: 60, right: 120, bottom: 40, left: 200 };
let barDirectorInnerWidth = barDirectorWidth - barDirectorMargin.left - barDirectorMargin.right;
let barDirectorInnerHeight = barDirectorHeight - barDirectorMargin.top - barDirectorMargin.bottom;

function initBarDirector(data) {
    const svg = d3.select("#bar-director")
        .append("svg")
        .attr("width", barDirectorWidth)
        .attr("height", barDirectorHeight);

    // Title
    svg.append("text")
        .attr("x", barDirectorWidth / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-size", "20px")
        .text("Top 10 Directors by Content Count");

    barDirectorSvg = svg.append("g")
        .attr("transform", `translate(${barDirectorMargin.left},${barDirectorMargin.top})`);

    // Tooltip
    barDirectorTooltip = d3.select("#bar-director")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("opacity", 0);

    updateBarDirector(data);
}

function updateBarDirector(data) {
    const directorCounts = {};

    data.forEach(d => {
        if (d.director && d.director.trim() !== "") {
            d.director.split(",").forEach(dir => {
                dir = dir.trim();
                directorCounts[dir] = (directorCounts[dir] || 0) + 1;
            });
        }
    });

    const topDirectors = Object.entries(directorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([director, count]) => ({ director, count }))
        .reverse(); // For better Y-axis order

    const x = d3.scaleLinear()
        .domain([0, d3.max(topDirectors, d => d.count)])
        .range([0, barDirectorInnerWidth]);

    const y = d3.scaleBand()
        .domain(topDirectors.map(d => d.director))
        .range([barDirectorInnerHeight, 0])
        .padding(0.1);

    // Clear previous
    barDirectorSvg.selectAll("*").remove();

    // Axes
    barDirectorSvg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("fill", "#fff")
        .style("font-size", "16px")
        .style("font-weight", "bold");

    barDirectorSvg.append("g")
        .attr("transform", `translate(0,${barDirectorInnerHeight})`)
        .call(d3.axisBottom(x).ticks(5))
        .selectAll("text")
        .style("fill", "#fff")


    // Bars
    barDirectorSvg.selectAll(".bar")
        .data(topDirectors)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.director))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", d => x(d.count))
        .attr("fill", "#e50914")
        .on("mouseover", function (event, d) {
            d3.select(this).attr("fill", "#ff4c4c");
            barDirectorTooltip
                .style("opacity", 1)
                .html(`<strong>${d.director}</strong>: ${d.count} titles`)
                .style("left", `${event.layerX + 20}px`)
                .style("top", `${event.layerY - 20}px`);
        })
        .on("mousemove", function (event) {
            barDirectorTooltip
                .style("left", `${event.layerX + 20}px`)
                .style("top", `${event.layerY - 20}px`);
        })
        .on("mouseout", function () {
            d3.select(this).attr("fill", "#e50914");
            barDirectorTooltip.style("opacity", 0);
        });
}

// Initialize if data is ready
if (typeof netflixData !== "undefined") {
    initBarDirector(netflixData);
}
