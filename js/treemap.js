let treemapSvg, treemapTooltip;

function initTreemap(data) {
    const width = 650;
    const height = 400;

    treemapSvg = d3.select("#heatmap") // reuse the heatmap container
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Title
    treemapSvg.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-size", "20px")
        .text("Genre Popularity (Treemap)");

    // Tooltip
    treemapTooltip = d3.select("#heatmap")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("opacity", 0);

    updateTreemap(data);
}

function updateTreemap(data) {
    const width = 650;
    const height = 360; // account for title

    // Genre frequency map
    const genreCounts = {};
    data.forEach(d => {
        if (d.listed_in) {
            d.listed_in.split(",").forEach(genre => {
                const g = genre.trim();
                genreCounts[g] = (genreCounts[g] || 0) + 1;
            });
        }
    });

    // Get top 15 genres only
    const topGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);

    const hierarchyData = {
        name: "genres",
        children: topGenres.map(([genre, count]) => ({
            name: genre,
            value: count
        }))
    };

    const root = d3.hierarchy(hierarchyData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    const treemapLayout = d3.treemap()
        .size([width, height - 40])
        .paddingInner(2);

    treemapLayout(root);

    const color = d3.scaleSequential(d3.interpolateReds)
        .domain([0, d3.max(root.leaves(), d => d.value)]);

    // Clear previous
    treemapSvg.selectAll("g.treemap-node").remove();

    const nodes = treemapSvg.selectAll("g.treemap-node")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("class", "treemap-node")
        .attr("transform", d => `translate(${d.x0},${d.y0 + 40})`);

    nodes.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .style("fill", d => color(d.value))
        .style("stroke", "#1c1c1c")
        .on("mouseover", function (event, d) {
            d3.select(this).style("stroke", "#fff");
            treemapTooltip
                .style("opacity", 1)
                .html(`<strong>${d.data.name}</strong>: ${d.data.value} titles`)
                .style("left", `${event.layerX + 20}px`)
                .style("top", `${event.layerY - 20}px`);
        })
        .on("mousemove", function (event) {
            treemapTooltip
                .style("left", `${event.layerX + 20}px`)
                .style("top", `${event.layerY - 20}px`);
        })
        .on("mouseout", function () {
            d3.select(this).style("stroke", "#1c1c1c");
            treemapTooltip.style("opacity", 0);
        });

    nodes.append("text")
        .attr("x", 5)
        .attr("y", 18)
        .style("fill", "#000")
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .text(d => d.data.name.length > 20 ? d.data.name.slice(0, 17) + "..." : d.data.name);
}

if (typeof netflixData !== "undefined") {
    initTreemap(netflixData);
} else if (typeof initTreemap === "function") {
    // Safe call for delayed loading
    d3.csv("data/netflix_titles.csv").then(data => {
        data.forEach(d => {
            d.release_year = +d.release_year;
            d.country = d.country || "Unknown";
            d.listed_in = d.listed_in || "Unknown";
        });
        initTreemap(data);
    });
}