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
    
    const magSlider = document.getElementById("magnitudeSlider");
    const magValue = document.getElementById("magValue");

    const filter = () => {
      const minMagnitude = +magSlider.value;
      magValue.textContent = minMagnitude; 
      const filteredData = data.filter(d => {
        if (d.mag < minMagnitude) return false;
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
    magSlider.addEventListener("input", filter);

    timeline.filter = filter;
    console.log(data);
  })
  .catch((error) => console.error(error));

  const sidebar = document.getElementById("sidebar");
const toggleSidebar = document.getElementById("toggleSidebar");
const slider = document.getElementById("magnitudeSlider");
const magValue = document.getElementById("magValue");
const tickmarksContainer = document.querySelector(".tickmarks");

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

// Generate tick marks dynamically
const updateTicks = () => {
  tickmarksContainer.innerHTML = ""; // Clear previous ticks
  const sliderHeight = slider.offsetHeight;

  for (let i = 0; i <= 9; i += 0.5) {
    const tick = document.createElement("span");
    tick.style.top = `${((9 - i) / 9) * sliderHeight}px`; // Align tick marks properly

    if (i % 1 === 0) {
      tick.classList.add("big");
      tick.setAttribute("data-value", i);
    }

    tickmarksContainer.appendChild(tick);
  }
};

// Ensure tick marks and thumb are in sync
const updateThumbPosition = () => {
  magValue.textContent = slider.value;
};

// Run updates
slider.addEventListener("input", updateThumbPosition);
window.addEventListener("resize", updateTicks);
updateTicks();
updateThumbPosition();