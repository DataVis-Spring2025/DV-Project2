import { loadData, hideLoading } from './loading.js';
import { Filter } from './filter.js';
import { Sidebar } from './sidebar.js';

let year = "2004-2025";

loadData(`data/AllYears/${year}.csv`)
	.then((data) => {
		// Convert parsedTime to integer timestamps
		data.forEach(d => d.parsedTime = new Date(d.time).getTime());

		const initialTimelineWidth = 50;
		const timeline = new Timeline(data, initialTimelineWidth);

		const filteredData = Filter.filterDataByDate(data, timeline.minDate, timeline.maxDate);

		// Separate heavy operations in setTimeout to avoid blocking the main thread
		setTimeout(() => {
			const leafletMap = new LeafletMap({ parentElement: "#my-map" }, filteredData);

			// Link the timeline and sidebar to the map
			leafletMap.linkTimeline(timeline);

			const lineChart = new MagnitudeChart({ parentElement: "#magnitudeChart" }, data);

			// Initialize Filter after visualizations are created
			const filter = new Filter(data, [leafletMap, lineChart]);

			// Initialize Sidebar with data
			const sidebar = new Sidebar("sidebar", data);


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
		}, 50);

		console.log(data);
	})
	.catch((error) => {
		console.error(error);
		requestAnimationFrame(() => {
			hideLoading(); // Hide loading animation on error
		});
	});