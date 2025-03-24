// Show loading animation and progress bar
const loadingContainer = document.getElementById("loading-container");
const progressBar = document.getElementById("progress-bar");
const loadingMessage = document.getElementById("loading-msg");

function showLoading(message) {
    loadingContainer.style.display = "block";
    updateLoadingMessage(message);
}

function hideLoading() {
    loadingContainer.style.display = "none";
}

function updateLoadingMessage(message) {
    requestAnimationFrame(() => {
    loadingMessage.innerHTML = message;
    });
}

function updateProgressBar(progress) {
    requestAnimationFrame(() => {
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${progress}%`;
    });
}

// Custom CSV loader with progress tracking
function loadCSVWithProgress(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onprogress = (event) => {
        if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            updateProgressBar(progress);
        }
        };
        xhr.onload = () => {
        if (xhr.status === 200) {
            const data = d3.csvParse(xhr.responseText);
            resolve(data);
        } else {
            reject(new Error(`Failed to load CSV: ${xhr.statusText}`));
        }
        };
        xhr.onerror = () => reject(new Error("Network error while loading CSV"));
        xhr.send();
    });
}

function loadData(url) {
    return new Promise((resolve, reject) => {
        showLoading("Loading data, please wait");

        loadCSVWithProgress(url)
            .then((data) => {
                updateProgressBar(100);
                console.log("number of items: " + data.length);
                updateLoadingMessage("Optimizing data for filtering");

                // Process and sort data
                data.forEach((d) => {
                    d.latitude = +d.latitude;
                    d.longitude = +d.longitude;
                    d.mag = +d.mag;
                    d.depth = +d.depth;
                    d.times=+d.time;
                    d.parsedTime = new Date(d.time); // Cache parsed date for faster sorting
                });

                data.sort((a, b) => a.parsedTime - b.parsedTime);

                updateLoadingMessage("Data loaded successfully");
                hideLoading();
                resolve(data);
            })
            .catch((error) => {
                console.error(error);
                hideLoading();
                reject(error);
            });
    });
}

export { showLoading, hideLoading, updateLoadingMessage, updateProgressBar, loadCSVWithProgress, loadData };

/*function loadData(year) {
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
  }*/