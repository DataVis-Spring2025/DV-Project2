d3.csv("data/2024-2025.csv")
  .then((data) => {
    console.log("number of items: " + data.length);

    data.forEach((d) => {
      //convert from string to number
      d.latitude = +d.latitude;
      d.longitude = +d.longitude;
      d.mag = +d.mag;
      d.depth = +d.depth;
      //d.duration = +d.mag;
      d.duration2 = Math.pow(10, (0.5 * d.mag - 1.5)) * d.rms;
      d.duration = (new Date(d.updated) - new Date(d.time)) / (1000*60);
    });

    // Initialize elements and then show them
    const leafletMap = new LeafletMap({ parentElement: "#my-map" }, data);
    const lineChart = new MagnitudeChart({ parentElement: "#magnitudeChart" }, data);
    const depthChart = new DepthChart({ parentElement: "#depthChart" }, data);
    const durationChart = new DChart({ parentElement: "#durationChart" }, data);
    const durationChart2 = new DurationChart({ parentElement: "#durationChart2" }, data);
    const timeline = new Timeline(data);

    document.getElementById("attribute-select").addEventListener("change", (event) => {
      const selected = event.target.value;

      // Hide all charts
      document.getElementById("magnitudeChart").style.display = "none";
      document.getElementById("depthChart").style.display = "none";
      document.getElementById("durationChart").style.display = "none";
      document.getElementById("durationChart2").style.display = "none";

      // Show the selected chart
      if (selected === "magnitude") {
          document.getElementById("magnitudeChart").style.display = "block";
      } else if (selected === "depth") {
          document.getElementById("depthChart").style.display = "block";
      } else if (selected === "duration") {
          document.getElementById("durationChart").style.display = "block";
      } else if (selected === "duration2") {
        document.getElementById("durationChart2").style.display = "block";
      } 
    });
    
    const filter = () => {
      const filteredData = data.filter(d => {

        // Example: filter out earthquakes with magnitude less than 5
        //if (d.mag < 5) valid = false;

        // add slider range filters here

        // timeline filter
        const dTime = new Date(d.time);
        if(dTime < new Date(timeline.minDate)) return false;
        if(dTime > new Date(timeline.maxDate)) return false;
        
        return true;
      });
      
      leafletMap.data = filteredData;
      lineChart.data = filteredData;
      depthChart.data = filteredData;
      durationChart.data = filteredData;
      durationChart2.data = filteredData;
      leafletMap.updateVis();
      lineChart.updateChart();
      depthChart.updateChart();
      durationChart.updateChart();
      durationChart2.updateChart();
    };

    timeline.filter = filter;
    console.log(data);
  })
  .catch((error) => console.error(error));
