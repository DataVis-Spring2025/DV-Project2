import { loadData, hideLoading, updateLoadingMessage, updateProgressBar, calculateMapDrawingProgress } from './loading.js';
import { Filter } from './filter.js';
import { Sidebar } from './sidebar.js';

let year = "2024-2025";

loadData(`data/AllYears/${year}.csv`)
	.then((data) => {
		// Convert parsedTime to integer timestamps
		data.forEach(d => {
			d.parsedTime = new Date(d.time).getTime();
			d.radius = (Math.exp(d.mag/1.01-0.13))*1000; // https://gis.stackexchange.com/questions/221931/calculate-radius-from-magnitude-of-earthquake-on-leaflet-map
		});

		const initialTimelineWidth = 50;
		const timeline = new Timeline(data, initialTimelineWidth);

		const filteredData = Filter.filterDataByDate(data, timeline.minDate, timeline.maxDate);

		// Separate heavy operations in setTimeout to avoid blocking the main thread
		setTimeout(() => {
			updateLoadingMessage("Drawing map...");
			let mapProgress = 0;

			// Simulate map drawing progress
			const mapDrawingInterval = setInterval(() => {
				mapProgress += 10; // Increment progress
				updateProgressBar(calculateMapDrawingProgress(mapProgress)); // Use map drawing progress calculation
				if (mapProgress >= 100) {
					clearInterval(mapDrawingInterval);
					document.dispatchEvent(new Event('dotsRendered'));
				}
			}, 50);

			// Initialize Sidebar first so map gets animation toggle value
			const sidebar = new Sidebar("sidebar", data);

			const leafletMap = new LeafletMap({ parentElement: "#my-map" }, filteredData);
			setTimeout(() => { leafletMap.updateVis() }, 300); // Update map after a short delay to ensure the sidebar is initialized
			// Link the timeline and sidebar to the map
			leafletMap.linkTimeline(timeline);

			const lineChart = new MagnitudeChart({ parentElement: "#magnitudeChart" }, data);
			const depthChart = new DepthChart({ parentElement: "#depthChart" }, data);
			const durationChart = new DChart({ parentElement: "#durationChart" }, data);
			const durationChart2 = new DurationChart({ parentElement: "#durationChart2" }, data);

			// Initialize Filter after visualizations are created
			const filter = new Filter(data, [leafletMap, lineChart]);

			leafletMap.linkSidebar(sidebar);

      // Initialize Sidebar with data
			timeline.linkSidebar(sidebar);
			const initalFilter = () => filter.apply(
				timeline.minDate, 
				timeline.maxDate, 
				sidebar.magMax, 
				sidebar.magMin, 
				sidebar.depMax,
				sidebar.depMin
			);
			timeline.filter = initalFilter; // Set the filter function to be used on timeline update
			sidebar.filter = initalFilter; // Set the filter function to be used on sidebar update

			document.addEventListener('dotsRendered', () => { // Listen on document
				hideLoading();
			});
		}, 50);

		console.log(data);
	})
	.catch((error) => {
		console.error(error);
		requestAnimationFrame(() => {
			hideLoading(); // Hide loading animation on error
		});
	});