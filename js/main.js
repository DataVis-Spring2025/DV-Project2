d3.csv("data/2024-2025.csv")
  .then((data) => {
    console.log("number of items: " + data.length);

    data.forEach((d) => {
      //convert from string to number
      d.latitude = +d.latitude;
      d.longitude = +d.longitude;
      d.mag = +d.mag;
    });

    // Initialize elements and then show them
    const leafletMap = new LeafletMap({ parentElement: "#my-map" }, data);
    const lineChart = new MagnitudeChart({ parentElement: "#magnitudeChart" }, data);
    const timeline = new Timeline(data);
    
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
      leafletMap.updateVis();
      lineChart.updateChart();
    };

    timeline.filter = filter;
    console.log(data);
  })
  .catch((error) => console.error(error));
