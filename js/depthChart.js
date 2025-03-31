class DepthChart {
  constructor({ parentElement }, data) {
      this.parentElement = parentElement;
      this.data = data;
      this.margin = { top: 20, right: 20, bottom: 60, left: 60 };
      this.width = 700 - this.margin.left - this.margin.right;
      this.height = 300 - this.margin.top - this.margin.bottom;

      this.initVis();
  }

  initVis() {
      let vis = this;

      vis.svg = d3.select(vis.parentElement)
          .append("svg")
          .attr("width", vis.width + vis.margin.left + vis.margin.right)
          .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
          .append("g")
          .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

      // Tooltip
      vis.tooltip = d3.select(vis.parentElement)
          .append("div")
          .attr("class", "tooltip2")
          .style("position", "absolute")
          .style("background", "#fff")
          .style("border", "1px solid #ccc")
          .style("padding", "5px")
          .style("border-radius", "5px")
          .style("display", "none")
          .style("pointer-events", "none");

      // Circle marker for hover effect
      vis.hoverCircle = vis.svg.append("circle")
          .attr("r", 5)
          .attr("fill", "none")
          .attr("stroke", "orange")
          .attr("stroke-width", 2)
          .style("display", "none");

      // Axes groups
      vis.xAxisG = vis.svg.append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0,${vis.height})`);

      vis.yAxisG = vis.svg.append("g")
          .attr("class", "y-axis");

      // X-axis label
      vis.svg.append("text")
          .attr("class", "x-axis-label")
          .attr("x", vis.width / 2)
          .attr("y", vis.height + vis.margin.bottom - 10)
          .style("text-anchor", "middle")
          .text("Depth (km)");

      // Y-axis label
      vis.svg.append("text")
          .attr("class", "y-axis-label")
          .attr("transform", "rotate(-90)")
          .attr("x", -vis.height / 2)
          .attr("y", -vis.margin.left + 20)
          .style("text-anchor", "middle")
          .text("Number of Earthquakes");

/*
      vis.svg.append("text")
          .attr("class", "chart-title") // Add a class to prevent removal
          .attr("x", vis.width / 2)
          .attr("y", -10) // Adjust positioning as needed
          .attr("text-anchor", "middle")
          .attr("font-size", "16px")
          .attr("font-weight", "bold")
          .text("Earthquake Depth Distribution");
*/
      vis.updateVis();
  }

  updateVis() {
      let vis = this;

      const maxDepth = d3.max(vis.data, d => d.depth);

      // Group data by depth intervals
      const depthCounts = d3.range(0, maxDepth + 0.1, 5).map(depth => ({
          depth: depth,
          count: vis.data.filter(d => d.depth >= depth && d.depth < depth + 5).length
      }));

      // Define scales
      vis.x = d3.scaleLinear()
          .domain(d3.extent(depthCounts, d => d.depth))
          .range([0, vis.width]);

      vis.y = d3.scaleLinear()
          .domain([0, d3.max(depthCounts, d => d.count)])
          .nice()
          .range([vis.height, 0]);

      // Define line generator
      vis.line = d3.line()
          .x(d => vis.x(d.depth))
          .y(d => vis.y(d.count));

      // Remove existing line before re-adding
      vis.svg.selectAll(".line").remove();

      // Draw line
      vis.svg.append("path")
          .data([depthCounts])
          .attr("class", "line")
          .attr("fill", "none")
          .attr("stroke", "green")
          .attr("stroke-width", 2)
          .attr("d", vis.line);

      // Tooltip and hover effect
      vis.svg.on("mousemove", (event) => {
          const mouseX = d3.pointer(event)[0];

          // Find closest data point
          const closest = depthCounts.reduce((prev, curr) =>
              Math.abs(vis.x(curr.depth) - mouseX) < Math.abs(vis.x(prev.depth) - mouseX) ? curr : prev
          );

          vis.hoverCircle
              .style("display", "block")
              .attr("cx", vis.x(closest.depth))
              .attr("cy", vis.y(closest.count));

          vis.tooltip
              .style("display", "block")
              .html(`Depth: ${closest.depth.toFixed(1)} km<br># of Quakes: ${closest.count}`)
              .style("top", `${event.pageY - 10}px`)
              .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
          vis.tooltip.style("display", "none");
          vis.hoverCircle.style("display", "none");
      });

      vis.renderVis();
  }

  renderVis() {
      let vis = this;
      vis.xAxisG.call(d3.axisBottom(vis.x));
      vis.yAxisG.call(d3.axisLeft(vis.y));
  }
  /*

  brushed(selection) {
      if (selection) {
          // Handle brushed selection
      } else {
          // Handle reset
      }
  }
      */
}
