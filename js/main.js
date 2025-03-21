let magmin = 1, magmax = 7;
let depmin = -5, depmax = 90;

// Global variable to store the loaded data
let globalData = [];
let
// loadData("2024");
import { loadData } from './loading.js';
import { Filter } from './filter.js';

loadData(`data/AllYears/${year}.csv`)//"data/2004-2025.csv")
	.then((data) => {
		// Convert parsedTime to integer timestamps
		data.forEach(d => d.parsedTime = new Date(d.time).getTime());

		const timeline = new Timeline(data, 50);
		const filteredData = Filter.filterDataByDate(data, timeline.minDate, timeline.maxDate);

    // seperate heavy operations in setTimeout to avoid blocking the main thread
		setTimeout(() => {
			const leafletMap = new LeafletMap({ parentElement: "#my-map" }, filteredData);
			const lineChart = new MagnitudeChart({ parentElement: "#magnitudeChart" }, data);

			// Initialize Filter after visualizations are created
			const filter = new Filter(data, [leafletMap, lineChart]);
			timeline.filter = () => filter.apply(timeline.minDate, timeline.maxDate);
		}, 50);

		console.log(data);
	})
	.catch((error) => {
		console.error(error);
		requestAnimationFrame(() => {
			loadingContainer.style.display = "none"; // Hide loading animation on error
		});
	});=
