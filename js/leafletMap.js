class LeafletMap {
  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
    };
    this.data = _data;
    this.selectedColorScale = 'type';
    this.initVis();
  }

  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    //ESRI
    vis.esriUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    vis.esriAttr = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

    //TOPO
    vis.topoUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    vis.topoAttr = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';

    //Stamen Terrain
    vis.stUrl = 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}';
    vis.stAttr = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    //OpenStreetMap Mapnik
    vis.osmUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    vis.osmAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    vis.baseLayers = {
      'topo': L.tileLayer(vis.topoUrl, { attribution: vis.topoAttr, ext: 'png' }),
      'esri': L.tileLayer(vis.esriUrl, { attribution: vis.esriAttr }),
      'stamen': L.tileLayer(vis.stUrl, { attribution: vis.stAttr, ext: 'png' }),
      'osm': L.tileLayer(vis.osmUrl, { attribution: vis.osmAttr })
    };

    vis.theMap = L.map('my-map', {
      center: [30, 0],
      zoom: 2,
      layers: [vis.baseLayers['topo']]
    });


    //if you stopped here, you would just have a map

    //initialize svg for d3 to add to map
    L.svg({ clickable: true }).addTo(vis.theMap); // we have to make the svg layer clickable
    vis.overlay = d3.select(vis.theMap.getPanes().overlayPane);
    vis.svg = vis.overlay.select("svg").attr("pointer-events", "auto");
    d3.select("#color-scale-select").on("change", function () {
      vis.selectedColorScale = this.value;  // Capture selected color scale
      console.log('Color scale selected:', this.value);
      vis.updateVis();
      vis.addLegend(vis.selectedColorScale);  // Pass selectedColorScale to addLegend
    });
    vis.magnitudeColorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain(d3.extent(vis.data, d => d.mag));

    vis.depthColorScale = d3.scaleSequential(d3.interpolateGreens)
      .domain(d3.extent(vis.data, d => d.depth));

    vis.typeColorScale = d3.scaleOrdinal(d3.schemeCategory10)
      .domain([...new Set(vis.data.map(d => d.type))]);  // Unique types

      
      
    // Magnitude color scale
    // const magnitudes = vis.data.map((d) => +d.mag);
    // vis.magnitudeColorScale = d3
    //   .scaleLinear()
    //   .domain(d3.extent(magnitudes))
    //   .range(["#e8f4f8", "#000080"]);

    //these are the city locations, displayed as a set of dots
    vis.Dots = vis.svg
      .selectAll("circle")
      .data(vis.data)
      .join("circle")
      .attr("fill", d => vis.getColor(d))
      .attr("stroke", "black")
      //Leaflet has to take control of projecting points.
      //Here we are feeding the latitude and longitude coordinates to
      //leaflet so that it can project them on the coordinates of the view.
      //the returned conversion produces an x and y point.
      //We have to select the the desired one using .x or .y
      .attr(
        "cx",
        (d) => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).x
      )
      .attr(
        "cy",
        (d) => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).y
      )
      .attr("r", (d) => 3) // --- TO DO- want to make radius proportional to earthquake size?
      .on("mouseover", function (event, d) {
        //function to add mouseover event
        d3.select(this)
          .transition() //D3 selects the object we have moused over in order to perform operations on it
          .duration("150") //how long we are transitioning between the two states (works like keyframes)
          .attr("fill", "red") //change the fill
          .attr("r", 4); //change radius

        //create a tool tip
        d3.select("#tooltip")
          .style("opacity", 1)
          .style("z-index", 1000000)
          // Format number with million and thousand separator
          //***** TO DO- change this tooltip to show useful information about the quakes
          // Define time format
const formatTime = d3.timeFormat("%Y-%m-%d %H:%M:%S");

// Update tooltip
d3.select("#tooltip").html(
  `<div class="tooltip-label">
    <img src="images/location-icon.png" alt="Location" width="20" height="20"> <span class="bold-label">Place:</span> ${d.place}<br>
    <img src="images/clock-icon.png" alt="Time" width="20" height="20"> <span class="bold-label">Time:</span> ${formatTime(new Date(d.time))}<br>
    <img src="images/magnitude-icon.png" alt="Magnitude" width="20" height="20"> <span class="bold-label">Magnitude:</span> ${d.mag}<br>
    <img src="images/depth-icon.png" alt="Depth" width="20" height="20"> <span class="bold-label">Depth:</span> ${d.depth}'km <br>
    <img src="images/latitude-icon.png" alt="Latitude" width="20" height="20"> <span class="bold-label">Latitude:</span> ${d.latitude}<br>
    <img src="images/longitude-icon.png" alt="Longitude" width="20" height="20"> <span class="bold-label">Longitude:</span> ${d.longitude}
  </div>`
);



})
      .on("mousemove", (event) => {
        //position the tooltip
        d3.select("#tooltip")
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px");
      })
      .on("mouseleave", function () {
        //function to add mouseover event
        d3.select(this)
    .transition()
    .duration(150) // Short transition time for smooth reversion
    .attr("fill", (d) => vis.getColor(d)) // Revert the color based on the color scale
    .attr("r", 3); // Revert to the original radius (or use a dynamic function 
        d3.select("#tooltip").style("opacity", 0); //turn off the tooltip
      });

    //handler here for updating the map, as you zoom in and out
    vis.theMap.on("zoomend", function () {
      vis.updateVis();
    });
    
    document.getElementById('basemap-select').addEventListener('change', function(event) {
      let selectedLayer = event.target.value;
      vis.theMap.eachLayer(layer => {
        if (layer instanceof L.TileLayer) vis.theMap.removeLayer(layer);
      });
      vis.baseLayers[selectedLayer].addTo(vis.theMap);
      vis.updateVis();
    });

  }

  updateVis() {
    let vis = this;

    const bounds = vis.theMap.getBounds();
    const zoomLevel = vis.theMap.getZoom(); // Get current zoom level
    const filteredData = vis.data.filter((d) =>
      bounds.contains([d.latitude, d.longitude])
    );

    vis.Dots = vis.svg
      .selectAll("circle")
      .data(filteredData)
      .join("circle")
      .attr("fill", d => vis.getColor(d))
      .attr("stroke", "black")
      .attr(
        "cx",
        (d) => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).x
      )
      .attr(
        "cy",
        (d) => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).y
      )
      .attr("r", (d) => this.sidebar.animationsEnabled ? this.timeline.isPlaying ? 0 : this.calculateScaledRadius(d, zoomLevel) : this.calculateConstantRadius()) // Use constant radius if animations are disabled
      .style("opacity", (d) => this.sidebar.animationsEnabled ? this.timeline.isPlaying ? 0 : this.calculateStaticOpacity(d) : 1) // Full opacity if animations are disabled
      .transition()
      .duration((d) => this.sidebar.animationsEnabled && this.timeline.isPlaying ? this.calculateAnimationDuration(d) : 0) // Animate only if animations are enabled and playing
      .ease(d3.easeLinear)
      .attr("r", (d) => this.sidebar.animationsEnabled ? this.calculateScaledRadius(d, zoomLevel) : this.calculateConstantRadius()) // Use constant radius if animations are disabled
      .style("opacity", (d) => this.sidebar.animationsEnabled ? this.calculateOpacity(d) : 1); // Full opacity if animations are disabled
  }
  getColor(d) {
    let vis = this;
    if (vis.selectedColorScale === "mag") {
      return vis.magnitudeColorScale(d.mag);
    } else if (vis.selectedColorScale === "depth") {
      return vis.depthColorScale(d.depth);
    } else {
      return vis.typeColorScale(d.type);
    }
  }

  addLegend(selectedColorScale) {
    let vis = this;
    const legendContent = d3.select('#legend');
    legendContent.html(""); // Clear previous content
  
    if (selectedColorScale === 'mag') {
      const magnitudes = [3, 4, 5];
      const colors = ["#00ff00", "#ffff00", "#ff8000", "#ff0000"];
  
      magnitudes.forEach((mag, i) => {
        const item = legendContent.append("div").style("display", "flex").style("align-items", "center");
        item.append("div")
          .style("width", "10px")
          .style("height", "10px")
          .style("margin-right", "5px")
          .style("background", colors[i]);
        item.append("span").text(`Magnitude > ${mag}`);
      });
    } else if (selectedColorScale === 'depth') {
      const depthValues = vis.data.map(d => +d.depth).filter(d => !isNaN(d));
      const depthExtent = d3.extent(depthValues);
      const depthColorScale = d3.scaleSequential(d3.interpolateYlGnBu).domain(depthExtent);
  
      const depthRange = Math.floor((depthExtent[1] - depthExtent[0]) / 3);
      for (let i = 0; i <= 3; i++) {
        const item = legendContent.append("div").style("display", "flex").style("align-items", "center");
        const color = depthColorScale(depthExtent[0] + (depthRange * i));
  
        item.append("div")
          .style("width", "10px")
          .style("height", "10px")
          .style("margin-right", "5px")
          .style("background", color);
        item.append("span").text(`${depthExtent[0] + (depthRange * i)} - ${depthExtent[0] + (depthRange * (i + 1))} km`);
      }
    } else if (selectedColorScale === 'type') {
      const types = [...new Set(vis.data.map(d => d.type))];
      vis.colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(types);
  
      types.forEach((type, i) => {
        const item = legendContent.append("div").style("display", "flex").style("align-items", "center");
        item.append("div")
          .style("width", "10px")
          .style("height", "10px")
          .style("margin-right", "5px")
          .style("background", vis.colorScale(type));
        item.append("span").text(type);
      });
    } else {
      console.log('Unknown color scale selected:', selectedColorScale);
    }
  }
  calculateScaledRadius(d, zoomLevel) {
    const baseRadius = +d.mag; // Base radius proportional to magnitude
    const scaleFactor = Math.pow(2, zoomLevel - 2); // Scale factor increases with zoom level
    return baseRadius * scaleFactor; // Adjust radius based on zoom level
  }

  calculateConstantRadius() {
    return 3; // Fixed radius of 3 when animations are off, no scaling
  }

  calculateAnimationDuration(d) {
    const timelineMinDate = this.timeline.minDate;
    const timelineMaxDate = this.timeline.maxDate;
    const eventDate = new Date(d.time).getTime();

    if (eventDate < timelineMinDate || eventDate > timelineMaxDate) return 0;

    const totalRange = timelineMaxDate - timelineMinDate;
    const proximity = (eventDate - timelineMinDate) / totalRange;

    return proximity * 2000; // Scale duration (e.g., 2000ms max)
  }

  calculateRadius(d) {
    const timelineMinDate = this.timeline.minDate;
    const timelineMaxDate = this.timeline.maxDate;
    const eventDate = new Date(d.time).getTime();

    if (eventDate < timelineMinDate || eventDate > timelineMaxDate) return 0;

    const totalRange = timelineMaxDate - timelineMinDate;
    const proximity = (eventDate - timelineMinDate) / totalRange;

    return proximity * +d.mag; // Scale radius based on proximity
  }

  calculateOpacity(d) {
    const timelineMinDate = this.timeline.minDate;
    const timelineMaxDate = this.timeline.maxDate;
    const eventDate = new Date(d.time).getTime();

    if (eventDate < timelineMinDate || eventDate > timelineMaxDate) return 0;

    const totalRange = timelineMaxDate - timelineMinDate;
    const proximity = (eventDate - timelineMinDate) / totalRange;

    return proximity; // Scale opacity directly based on proximity (start invisible, become visible)
  }

  calculateStaticOpacity(d) {
    // Dynamically calculate opacity when the timeline is paused
    const timelineMinDate = this.timeline.minDate;
    const timelineMaxDate = this.timeline.maxDate;
    const eventDate = new Date(d.time).getTime();

    if (eventDate < timelineMinDate || eventDate > timelineMaxDate) return 0;

    const totalRange = timelineMaxDate - timelineMinDate;
    const proximity = (eventDate - timelineMinDate) / totalRange;

    return proximity; // Scale opacity directly based on proximity
  }

  linkTimeline(timeline) {
    this.timeline = timeline;
  }

  linkSidebar(sidebar) {
    this.sidebar = sidebar; // Link the sidebar to access the animation toggle state
  }


  clearMap() {
    // Clear existing layers before adding new ones
    if (this.map) {
        this.map.eachLayer((layer) => {
            if (layer instanceof L.TileLayer) return; // Skip base layers
            this.map.removeLayer(layer);
        });
    }
    
}
}


