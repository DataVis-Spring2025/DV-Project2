import { loadData, hideLoading } from './loading.js';
import { Filter } from './filter.js';
import { Sidebar } from './sidebar.js';

let year = "2004-2025";

loadData(`data/AllYears/${year}.csv`)
	.then((data) => {
		// Convert parsedTime to integer timestamps
		data.forEach(d => d.parsedTime = new Date(d.time).getTime());

		const timeline = new Timeline(data, 50);
		const filteredData = Filter.filterDataByDate(data, timeline.minDate, timeline.maxDate);

		// Separate heavy operations in setTimeout to avoid blocking the main thread
		setTimeout(() => {
			const leafletMap = new LeafletMap({ parentElement: "#my-map" }, filteredData);
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

// open menu sidebar
document.getElementById('menu-btn').addEventListener('click', function () {
	document.getElementById('menusidebar').classList.add('open');
	document.getElementById('menu-btn').style.display = 'none';  // Hide the menu button
  });
  
  // close menu sidebar
  document.getElementById('close-btn').addEventListener('click', function () {
	document.getElementById('menusidebar').classList.remove('open');
	document.getElementById('menu-btn').style.display = 'block';  // Show the menu button again
  });
  
  document.addEventListener('click', function (event) {
	if (!document.getElementById('menusidebar').contains(event.target) && !document.getElementById('menu-btn').contains(event.target)) {
		document.getElementById('menusidebar').classList.remove('open');
		document.getElementById('menu-btn').style.display = 'block';  // Show the menu button again
	}
  });