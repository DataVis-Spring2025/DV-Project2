# [Project Name]

## Motivation
[TODO: Explain the motivation for your application. What can it allow someone to understand?]

## Data
The dataset used in this project was obtained from the United States Geological Survey (USGS) through their Earthquake Catalog. Due to limitations on data retrieval, earthquake records had to be downloaded year by year before being merged into a single comprehensive CSV file covering events from 2004 to 2025.

The original dataset contained 22 columns, each providing specific details about recorded seismic events. For our analysis, we focused on the most relevant attributes that contribute to understanding earthquake patterns and visualizing them effectively. The key columns used in our project are:

	1. Magnitude (mag) – Represents the magnitude of the earthquake, indicating its intensity.
	2. Latitude & Longitude (latitude, longitude) – Geographical coordinates specifying the earthquake’s exact location on the map.
	3. Depth (depth) – The depth at which the earthquake originated, measured in kilometers.
	4. Time (time) – The timestamp of the earthquake occurrence in UTC (Coordinated Universal Time).
	5. Type (type) – Describes the nature of the seismic activity, indicating the cause of the event (e.g., earthquake, explosion, induced event).

Official USGS documentation provides further insights into the dataset’s structure, data collection methodologies, and potential biases in earthquake reporting. By leveraging this dataset, our project aims to provide an interactive and insightful visualization of global earthquake activity, offering valuable information for research, risk assessment, and public awareness.

Link to data: https://github.com/DataVis-Spring2025/DV-Project2/tree/main/data <br/>
Link to earthquake catalog: https://earthquake.usgs.gov/earthquakes/search/<br/>
Link to catalog documentation: https://earthquake.usgs.gov/data/comcat/#type

## Visualization Components
The project features multiple dynamic views that update based on user interactions, providing an intuitive and engaging experience. The visualization components used are: 

1. Interactive Map
	The earthquake visualization includes several interactive features to enhance user experience. Users can hover over points to view detailed earthquake information and zoom or pan to explore different regions. A right-side menu allows for changing map styles, while the legend updates automatically based on selected attributes. Animations improve data representation, and a timeline slider enables users to control the displayed earthquake time range. Additionally, an event counter shows the number of currently displayed earthquakes, and a speed control adjusts the rate at which events appear over time.

2. Filter Panel 
	Click Filter Options to open the control panel, where you can adjust the Magnitude and Depth sliders to filter earthquakes based on their intensity and depth. There's also a Color By option to change the point color representation according to different attributes. Additionally, you can enable or disable Animations, Audio, and Shaking effects to customize the visualization experience.

3. Filter Effects:
	Changing the magnitude or depth filters updates both the map and the line chart. Additionally, selecting a new Color By option updates the point colors and the legend.

4. Line Chart 
	Located at the bottom of the screen, the visualization displays a time-series analysis of earthquake events. The X-axis represents Magnitude, Depth, or Duration based on user selection, while the Y-axis shows the number of earthquakes.

## Design Sketches and Justifications
[TODO: Include your design sketches and explain the reasoning behind your design choices.]

## Discoveries
Found that in 2009 Europe went from several small magnitude earthquakes, to a lul, to suddenly a handful of very high magnitude earthquakes.

[TODO: Present some findings you arrive at with your application.]

## Process
### Development
- Create Miro Card
- Assign Miro Card to team member
- Create branch
- Work on card to present work at next meeting
- Present work at meeting, if it passes, PR to main
- Repeat

### Libraries
- Bootstrap (make things pretty)
- d3 (automate visualization creation)
- drawdown (markdown -> html for this page)
- JQuery (quick dom manipulation and range slider inputs)
- Leaflet (zoomable map)	
- Popper (make things pretty)

### How to run
Use nginx or a vscode extension like live server to run it locally.
[TODO: Describe your process. What libraries did you use? How did you structure your code? How can someone access and run it? Include a link to your code and the live application (if deployed).]

## Demo Video
https://youtu.be/6tEtrOu1Ifs



[![YouTube](http://i.ytimg.com/vi/6tEtrOu1Ifs/hqdefault.jpg)](https://www.youtube.com/watch?v=6tEtrOu1Ifs)

## Team Contributions
[TODO: Document who on your team worked on which components of the project. For example: ]

### Iswarya Mikkili
- Implemented the color by option filter in the left sidebar which changes the colors of the quakes on the map along with the legend to explain 
- Added the tooltip which explains the details when mouse hovered over the data points on the map. 
### Jasmine Mogadam
- Thing 1
- Thing 2
### Rashi Loni
- Implemented level 3 of the project by creating a visualization to help understand frequencies of earthquakes by depth, magnitude, and duration.
- Filmed the demo video and researched to find a formula to estimate duration.
### Samraysh Pellakur
- Implemented Range Sliders for interactive filtering of earthquakes based on magnitude and depth, allowing users to refine their data view dynamically.
- Enhanced Timeline Animation with visual and audio effects, along with dedicated control buttons, to create a more immersive and engaging experience while exploring seismic activity over time.
### Tulasi Rama Raju Chittiraju
- Thing 1
- Thing 2
