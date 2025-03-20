class DepthChart {
  constructor({ parentElement }, data) {
      this.parentElement = parentElement;
      this.data = data;
      this.margin = { top: 20, right: 20, bottom: 60, left: 60 };
      this.width = 700 - this.margin.left - this.margin.right;
      this.height = 300 - this.margin.top - this.margin.bottom;

      this.initChart();
  }

  initChart() {
      let vis = this;
      vis.svg = d3.select(vis.parentElement)
          .append("svg")
          .attr("width", vis.width + vis.margin.left + vis.margin.right)
          .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
          .append("g")
          .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
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
          .attr("fill", "none")  // No fill
          .attr("stroke", "orange")  // Outline color
          .attr("stroke-width", 2)
          .style("display", "none");

      vis.updateChart();
  }

  updateChart() {
      let vis = this;

      const maxDepth = d3.max(vis.data, d => d.depth);

      const depthCounts = d3.range(0, maxDepth, 5).map(depth => {
          return {
              depth: depth,
              count: vis.data.filter(d => d.depth >= depth && d.depth < depth + 0.1).length
          };
      });

      const x = d3.scaleLinear()
          .domain([0, 700]) // Fixed upper limit at 700
          .range([0, vis.width]);

      const y = d3.scaleLinear()
          .domain([0, d3.max(depthCounts, d => d.count)])
          .nice()
          .range([vis.height, 0]);

      vis.svg.selectAll("*:not(circle)").remove();

      let xTicks = x.ticks(10);

      // Ensure the next highest tick above maxDepth is included, but not maxDepth itself
      let nextTickAboveMax = xTicks.find(tick => tick > maxDepth);
      xTicks = xTicks.filter(tick => tick !== maxDepth);

      if (nextTickAboveMax && !xTicks.includes(nextTickAboveMax)) {
          xTicks.push(nextTickAboveMax);
      }

      // X-axis
      vis.svg.append("g")
          .attr("class", "x-axis")
          .attr("transform", "translate(0," + vis.height + ")")
          .call(d3.axisBottom(x).tickValues(xTicks));

      // Y-axis
      vis.svg.append("g")
          .attr("class", "y-axis")
          .call(d3.axisLeft(y));

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

      // Append brush group BEFORE the line so it doesn’t block mouse events
      vis.brushG = vis.svg.append('g')
          .attr('class', 'brush x-brush');

      vis.brush = d3.brushX()
          .extent([[0, 0], [vis.width, vis.height]])
          .on('brush', function({selection}) {
              if (selection) vis.brushed(selection);
          })
          .on('end', function({selection}) {
              if (!selection) vis.brushed(null);
          });

      vis.brushG
          .call(vis.brush);

      const line = d3.line()
          .x(d => x(d.depth))
          .y(d => y(d.count));

      const path = vis.svg.append("path")
          .data([depthCounts])
          .attr("class", "line")
          .attr("d", line)
          .attr("fill", "none")
          .attr("stroke", "green")
          .attr("stroke-width", 2);

      // Tooltip and circle marker hover effect
      path.on("mousemove", (event) => {
          const mouseX = d3.pointer(event)[0];
          const closest = depthCounts.reduce((prev, curr) =>
              Math.abs(x(curr.depth) - mouseX) < Math.abs(x(prev.depth) - mouseX) ? curr : prev
          );

          vis.hoverCircle
              .style("display", "block")
              .attr("cx", x(closest.depth))
              .attr("cy", y(closest.count));

          vis.tooltip
              .style("display", "block")
              .html(`Depth: ${closest.depth.toFixed(1)}<br>Count: ${closest.count}`)
              .style("top", (event.pageY - 10) + "px")
              .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", () => {
          vis.tooltip.style("display", "none");
          vis.hoverCircle.style("display", "none");
      });
  }

  brushed(selection) {
      let vis = this;

      if (selection) {
          // Get pixel coordinates of brush selection
      } else {
      }
  }
}
