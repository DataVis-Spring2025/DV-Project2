# [Project Name]

## Motivation
[TODO: Explain the motivation for your application. What can it allow someone to understand?]

## Data
The dataset used in this project was obtained from the United States Geological Survey (USGS) through their Earthquake Catalog. Due to limitations on data retrieval, earthquake records had to be downloaded year by year before being merged into a single comprehensive CSV file covering events from 2004 to 2025.

The original dataset contained 22 columns, each providing specific details about recorded seismic events. For our analysis, we focused on the most relevant attributes that contribute to understanding earthquake patterns and visualizing them effectively. The key columns used in our project are:

	1.	Magnitude (mag) – Represents the magnitude of the earthquake, indicating its intensity.
	2.	Latitude & Longitude (latitude, longitude) – Geographical coordinates specifying the earthquake’s exact location on the map.
	3.	Depth (depth) – The depth at which the earthquake originated, measured in kilometers.
	4.	Time (time) – The timestamp of the earthquake occurrence in UTC (Coordinated Universal Time).
	5.	Type (type) – Describes the nature of the seismic activity, indicating the cause of the event (e.g., earthquake, explosion, induced event).

Official USGS documentation provides further insights into the dataset’s structure, data collection methodologies, and potential biases in earthquake reporting. By leveraging this dataset, our project aims to provide an interactive and insightful visualization of global earthquake activity, offering valuable information for research, risk assessment, and public awareness.

Link to data: https://github.com/DataVis-Spring2025/DV-Project2/tree/main/data <br/>
Link to earthquake catalog: https://earthquake.usgs.gov/earthquakes/search/<br/>
Link to catalog documentation: https://earthquake.usgs.gov/data/comcat/#type

## Visualization Components
[TODO: Explain each view of the data, the GUI, etc. Explain how you can interact with your application, and how the views update in response to these interactions.]

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
- Thing 1
- Thing 2
### Jasmine Mogadam
- Thing 1
- Thing 2
### Rashi Loni
- thing 1
- thing 2
### Samraysh Pellakur
- Implemented Range Sliders for interactive filtering of earthquakes based on magnitude and depth, allowing users to refine their data view dynamically.
- Enhanced Timeline Animation with visual and audio effects, along with dedicated control buttons, to create a more immersive and engaging experience while exploring seismic activity over time.
### Tulasi Rama Raju Chittiraju
- Thing 1
- Thing 2
