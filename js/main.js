let magmin = 1, magmax = 7;
let depmin = -5, depmax = 90;

// Global LeafletMap and MagnitudeChart instances
let leafletMap;
let lineChart;
let timeline;  // Global variable for the timeline

// Global variable to store the loaded data
let globalData = [];

// Function to load data based on selected year
function loadData(year) {
  d3.csv(`data/AllYears/${year}.csv`)
    .then((data) => {
      console.log(`Loaded data for year: ${year}`);
      console.log("Number of items: " + data.length);

      data.forEach((d) => {
        d.latitude = +d.latitude;
        d.longitude = +d.longitude;
        d.mag = +d.mag;
      });

      globalData = data;  // Store data globally for later use

      // Check if the map is already initialized, if not, initialize it
      if (!leafletMap) {
        leafletMap = new LeafletMap({ parentElement: "#my-map" }, data);
      } else {
        // Update the map's data and visualizations if the map is already initialized
        leafletMap.data = data;
        leafletMap.updateVis();
      }

      // Check if the line chart is already initialized, if not, initialize it
      if (!lineChart) {
        lineChart = new MagnitudeChart({ parentElement: "#magnitudeChart", magmin, magmax }, data);
      } else {
        // Update the line chart's data if it's already initialized
        lineChart.data = data;
        lineChart.updateChart(magmin, magmax);
      }

      // Remove the previous timeline if it exists
      if (timeline) {
        timeline.remove();  // This should remove the old timeline from the DOM
      }

      // Initialize the new timeline with the new data
      timeline = new Timeline(data);
      timeline.filter = filter; // Set the filter function to be used on timeline update
      timeline.updateTimeline();  // Call updateTimeline to re-render the timeline

      // Initial filter on load
      filter();
    })
    .catch((error) => console.error(error));
}

// Global filter function
function filter() {
  const filteredData = globalData.filter(d => {
    if (d.mag <= magmin || d.mag >= magmax) return false;
    if (d.depth <= depmin || d.depth >= depmax) return false;

    // Timeline filter
    const dTime = new Date(d.time);
    if (dTime < new Date(timeline.minDate)) return false;
    if (dTime > new Date(timeline.maxDate)) return false;

    return true;
  });

  // Update visualizations with filtered data
  leafletMap.data = filteredData;
  lineChart.data = filteredData;
  leafletMap.updateVis();
  lineChart.updateChart(magmin, magmax);
}

// jQuery for slider setup
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
      filter();
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
      filter();
    }
  });

  $("#depth").val($("#slider-range1").slider("values", 0) + " - " + $("#slider-range1").slider("values", 1));
});

// Sidebar toggle functionality
const sidebar = document.getElementById("sidebar");
const toggleSidebar = document.getElementById("toggleSidebar");

toggleSidebar.addEventListener("click", (event) => {
  sidebar.classList.toggle("open");
  event.stopPropagation();
});

document.addEventListener("click", (event) => {
  if (!sidebar.contains(event.target) && !toggleSidebar.contains(event.target)) {
    sidebar.classList.remove("open");
  }
});

// Handle year selection from dropdown
document.getElementById("yearSelect").addEventListener("change", function () {
  const selectedYear = this.value;
  loadData(selectedYear);
});

// Load initial data for a default year (e.g., 2024)
loadData("2024");

// Add event listener for the filter button
document.getElementById("filterButton").addEventListener("click", function () {
  console.log("Filter applied with magmin:", magmin, "magmax:", magmax, "depmin:", depmin, "depmax:", depmax);
  filter(); // Apply filter when button is clicked
});