// Show loading animation and progress bar
const loadingContainer = document.getElementById("loading-container");
const progressBar = document.getElementById("progress-bar");
const loadingMessage = document.getElementById("loading-msg");

function showLoading(message) {
    loadingContainer.style.display = "block";
    updateLoadingMessage(message);
}

async function hideLoading() {
    updateLoadingMessage("Loading complete"); // Show "Loading complete" before hiding
    updateProgressBar(100); // Ensure the bar is set to 100%
    setTimeout(() => {
        loadingContainer.style.display = "none";
    }, 1000); // Add a 1000ms delay before hiding
}

async function updateLoadingMessage(message) {
    requestAnimationFrame(() => {
        loadingMessage.innerHTML = message;
    });
}

function calculateCSVProgress(progress) {
    return progress * 0.82; // CSV loading progress (0% to 82%)
}

function calculateMapDrawingProgress(progress) {
    return 82 + (progress * 0.18); // Map drawing progress (82% to 100%)
}

async function updateProgressBar(progress) {
    requestAnimationFrame(() => {
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${Math.round(progress)}%`;
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
                updateProgressBar(calculateCSVProgress(progress)); // Use CSV progress calculation
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
                    d.times = +d.time;
                    d.parsedTime = new Date(d.time); // Cache parsed date for faster sorting
                    d.duration2 = Math.pow(10, (0.5 * d.mag - 1.5)) * d.rms;
                    d.duration = (new Date(d.updated) - new Date(d.time)) / (1000*60);
                });

                data.sort((a, b) => a.parsedTime - b.parsedTime);

                updateLoadingMessage("Drawing map"); // Update message to "Drawing map"
                updateProgressBar(calculateMapDrawingProgress(calculateCSVProgress(100))); // Update progress bar for map drawing
                resolve(data);
            })
            .catch((error) => {
                console.error(error);
                hideLoading();
                reject(error);
            });
    });
}

export { calculateMapDrawingProgress, showLoading, hideLoading, updateLoadingMessage, updateProgressBar, loadCSVWithProgress, loadData };