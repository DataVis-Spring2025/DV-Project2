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

    //OpenStreetMap Mapnik
    vis.osmUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    vis.osmAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    vis.cyclOSMUrl = 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png';
    vis.cyclOSMAttr = '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    vis.topgreyUrl = 'http://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_grau/default/WEBMERCATOR/{z}/{y}/{x}.png';
    vis.topgreyAttr = 'Map data: &copy; <a href="http://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>';

    vis.CARTdarkUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    vis.CARTdarkAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

    vis.NATgeoUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}';
    vis.NATgeoAttr = 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC';

    vis.WorldShadedUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}';
    vis.WorldShadedAttr = 'Tiles &copy; Esri &mdash; Source: Esri';

    vis.WorldTerrainUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}';
    vis.WorldTerrainAttr = 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS';

    vis.WorldPhysicalUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}';
    vis.WorldPhysicalAttr = 'Tiles &copy; Esri &mdash; Source: US National Park Service';

    vis.baseLayers = {
      'topo': L.tileLayer(vis.topoUrl, { attribution: vis.topoAttr, ext: 'png' }),
      'esri': L.tileLayer(vis.esriUrl, { attribution: vis.esriAttr }),
      'osm': L.tileLayer(vis.osmUrl, { attribution: vis.osmAttr }),
      'cyclosm': L.tileLayer(vis.cyclOSMUrl, { attribution: vis.cyclOSMAttr }),
      'topgrey': L.tileLayer(vis.topgreyUrl, { attribution: vis.topgreyAttr }),
      'CARTdark': L.tileLayer(vis.CARTdarkUrl, { attribution: vis.CARTdarkAttr }),
      'NATgeo': L.tileLayer(vis.NATgeoUrl, { attribution: vis.NATgeoAttr }),
      'WorldShaded': L.tileLayer(vis.WorldShadedUrl, { attribution: vis.WorldShadedAttr }),
      'WorldTerrain': L.tileLayer(vis.WorldTerrainUrl, { attribution: vis.WorldTerrainAttr }),
      'WorldPhysical': L.tileLayer(vis.WorldPhysicalUrl, { attribution: vis.WorldPhysicalAttr }),

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
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
    .domain(d3.extent(vis.data, d => d.mag));

    // Magnitude color scale
    const magnitudes = vis.data.map((d) => +d.mag);
    vis.magnitudeColorScale = d3
      .scaleLinear()
      .domain(d3.extent(magnitudes))
      .range(["#e8f4f8", "#000080"]);

    //these are the city locations, displayed as a set of dots
    vis.Dots = vis.svg
      .selectAll("circle")
      .data(vis.data)
      .join("circle")
      .attr("fill", (d) => {
        return vis.magnitudeColorScale(+d.mag);
      })
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
        d3.select("#tooltip")
          .style("display", "block") // Change to display block
          .style("z-index", 1000000);

        const formatTime = d3.timeFormat("%Y-%m-%d %H:%M:%S");

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
        d3.select("#tooltip")
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px"); // Ensure tooltip follows cursor
      })
      .on("mouseleave", function () {
        //function to add mouseover event
        d3.select(this)
          .transition() //D3 selects the object we have moused over in order to perform operations on it
          .duration("150") //how long we are transitioning between the two states (works like keyframes)
          .attr("fill", (d) => {
            return vis.magnitudeColorScale(+d.mag);
          }) //change the fill  TO DO- change fill again
          .attr("r", 3); //change radius

        d3.select("#tooltip").style("opacity", 0); //turn off the tooltip
      });

    // Emit an event when all dots are rendered
    setTimeout(() => {
      const event = new Event('dotsRendered');
      document.dispatchEvent(event); // Use document to dispatch the event
    }, 0); // Ensure this runs after rendering is complete

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
      .attr("fill", (d) => vis.magnitudeColorScale(+d.mag))
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
      .on("mouseover", function (event, d) {
        d3.select("#tooltip")
          .style("display", "block")
          .style("z-index", 1000000)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px")

        const formatTime = d3.timeFormat("%Y-%m-%d %H:%M:%S");

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
        d3.select("#tooltip")
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px"); // Ensure tooltip follows cursor
      })
      .on("mouseleave", function () {
        d3.select("#tooltip").style("display", "none"); // Change to display none
      })
      .transition()
      .duration((d) => this.sidebar.animationsEnabled && this.timeline.isPlaying ? this.calculateAnimationDuration(d) : 0) // Animate only if animations are enabled and playing
      .ease(d3.easeLinear)
      .attr("r", (d) => this.sidebar.animationsEnabled ? this.calculateScaledRadius(d, zoomLevel) : this.calculateConstantRadius()) // Use constant radius if animations are disabled
      .style("opacity", (d) => this.sidebar.animationsEnabled ? this.calculateOpacity(d) : 1) // Full opacity if animations are disabled
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

  renderVis() {
    let vis = this;

    //not using right now...
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


