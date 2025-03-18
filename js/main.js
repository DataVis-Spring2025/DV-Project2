let magmin = 1, magmax = 7;
let depmin = -5, depmax = 90;
$(function () {
  console.log("Initializing sliders...");

  // Magnitude Slider
  $("#slider-range").slider({
    min: 1,
    max: 9.5,
    orientation: "horizontal",
    range: true,
    step: 0.5,
    values: [magmin, magmax],
    create: function () {
      console.log("Magnitude slider created.");
    },
    slide: function (event, ui) {
      $("#magnitude").val(ui.values[0] + " - " + ui.values[1]);
      magmin = ui.values[0];
      magmax = ui.values[1];
    }
  });

  $("#magnitude").val($("#slider-range").slider("values", 0) + " - " + $("#slider-range").slider("values", 1));

  // Depth Slider
  $("#slider-range1").slider({
    min: -10,
    max: 800,
    orientation: "horizontal",
    range: true,
    step: 1,
    values: [depmin, depmax],
    create: function () {
      console.log("Depth slider created.");
    },
    slide: function (event, ui) {
      $("#depth").val(ui.values[0] + " - " + ui.values[1]);
      depmin = ui.values[0];
      depmax = ui.values[1];
    }
  });

  $("#depth").val($("#slider-range1").slider("values", 0) + " - " + $("#slider-range1").slider("values", 1));

});

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
    const lineChart = new MagnitudeChart({ parentElement: "#magnitudeChart" , magmin,magmax},data);
    const timeline = new Timeline(data);

    function filter() {
      const filteredData = data.filter(d => {
        if (d.mag <= magmin || d.mag >= magmax) return false;
        if (d.depth <= depmin || d.depth >= depmax) return false;

        // Timeline filter
        const dTime = new Date(d.time);
        if (dTime < new Date(timeline.minDate)) return false;
        if (dTime > new Date(timeline.maxDate)) return false;

        return true;
      });

      // Update visualizations
      leafletMap.data = filteredData;
      lineChart.data = filteredData;
      leafletMap.updateVis();
      lineChart.updateChart(magmin,magmax);
    }

    // Call filter when timeline is updated
    timeline.filter = filter;

    document.getElementById("filterButton").addEventListener("click", function () {
      console.log("Filter applied with magmin:", magmin, "magmax:", magmax, "depmin:", depmin, "depmax:", depmax);
      filter(); // Apply filter when button is clicked
    });

    // Initial filter on load
    filter();
    console.log(data);
  })
  .catch((error) => console.error(error));

const sidebar = document.getElementById("sidebar");
const toggleSidebar = document.getElementById("toggleSidebar");

// Toggle sidebar visibility
toggleSidebar.addEventListener("click", (event) => {
  sidebar.classList.toggle("open");
  event.stopPropagation(); // Prevents click from propagating to document
});

// Close sidebar when clicking outside of it
document.addEventListener("click", (event) => {
  if (!sidebar.contains(event.target) && !toggleSidebar.contains(event.target)) {
    sidebar.classList.remove("open");
  }
});


