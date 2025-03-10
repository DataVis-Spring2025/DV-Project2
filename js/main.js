d3.csv("data/2024-2025.csv")
  .then((data) => {
    console.log("number of items: " + data.length);

    data.forEach((d) => {
      //convert from string to number
      d.latitude = +d.latitude;
      d.longitude = +d.longitude;
    });

    // Initialize chart and then show it
    const leafletMap = new LeafletMap({ parentElement: "#my-map" }, data);

    // Initialize timeline with leafletMap
    const timeline = new Timeline(leafletMap);
  })
  .catch((error) => console.error(error));
