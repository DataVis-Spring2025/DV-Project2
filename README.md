# Data Visualization - Project 2

## Motivation
Earthquakes are natural disasters that can destroy neighborhoods and cities. Earthquakes are difficult to predict and it is even more challenging to prevent the damage from occurring in affected communities and areas. This application takes earthquake data from the past 20 years and presents it in a way that is easy to analyze and comprehend. Understanding where and when earthquakes occur can help people to identify patterns and prepare for future disasters. Our application allows people to explore how earthquakes occur over time for two decades. The animation smoothly displays the changes in occurrences as the circles on the map fade in and out with time. The user can see the distribution of earthquakes on the world map and see where earthquakes occur the most, such as on fault lines, or see where earthquakes are the most unexpected. It lets the user explore how earthquakes are distributed by how strong they are, how deep they occur, and how long they last. People can get more familiar with seismic events and become educated about general earthquakes and how they vary by depth and magnitude. The user can see which earthquake magnitudes and depths are the most common and least common and how they are scattered across countries and continents. Additionally, this application can help debunk common misconceptions, such as the idea that earthquakes happen only in certain places (California, Japan, etc.).

## Data
The dataset used in this project was obtained from the United States Geological Survey (USGS) through their Earthquake Catalog. Due to limitations on data retrieval, earthquake records had to be downloaded year by year before being merged into a single comprehensive CSV file covering events from 2004 to 2025.

The original dataset contained 22 columns, each providing specific details about recorded seismic events. For our analysis, we focused on the most relevant attributes that contribute to understanding earthquake patterns and visualizing them effectively. The key columns used in our project are:

	1. Magnitude (mag) – Represents the magnitude of the earthquake, indicating its intensity.
	2. Latitude & Longitude (latitude, longitude) – Geographical coordinates specifying the earthquake’s exact location on the map.
	3. Depth (depth) – The depth at which the earthquake originated, measured in kilometers.
	4. Time (time) – The timestamp of the earthquake occurrence in UTC (Coordinated Universal Time).
	5. Type (type) – Describes the nature of the seismic activity, indicating the cause of the event (e.g., earthquake, explosion, induced event).

Official USGS documentation provides further insights into the dataset’s structure, data collection methodologies, and potential biases in earthquake reporting. By leveraging this dataset, our project aims to provide an interactive and insightful visualization of global earthquake activity, offering valuable information for research, risk assessment, and public awareness.

Estimated duration: <br/>
The earthquake duration was estimated from the magnitude and the rms columns. The formula to calculate duration was derived from the emprical formula that estimated magnitude from the duration and amplitude (M =  -0.87 + 2.00 log(r) + 0.0035 A). We took this formula and rearranged it to calculate duration from magnitude. The resulting formula used in the code is <br/>d.duration = Math.pow(10, (0.5 * d.mag - 1.5)) * d.rms <br/>The derived formula comes from the paper "A Method of Estimating Magnitude of Local Earthquakes From Signal Duration" by Lee et al. (1972).<br/>

<i>Credits: https://pubs.usgs.gov/of/1972/0223/report.pdf</i>

Link to data: https://github.com/DataVis-Spring2025/DV-Project2/tree/main/data <br/>
Link to earthquake catalog: https://earthquake.usgs.gov/earthquakes/search/<br/>
Link to catalog documentation: https://earthquake.usgs.gov/data/comcat/#type

## Visualization Components
The project features multiple dynamic views that update based on user interactions, providing an intuitive and engaging experience. The visualization components used are: 

1. Interactive Map:<br/>
	The earthquake visualization includes several interactive features to enhance user experience. Users can hover over points to view detailed earthquake information and zoom or pan to explore different regions. A right-side menu allows for changing map styles, while the legend updates automatically based on selected attributes. Animations improve data representation, and a timeline slider enables users to control the displayed earthquake time range. Additionally, an event counter shows the number of currently displayed earthquakes, and a speed control adjusts the rate at which events appear over time.

2. Filter Panel:<br/> 
	Click Filter Options to open the control panel, where you can adjust the Magnitude and Depth sliders to filter earthquakes based on their intensity and depth. There's also a Color By option to change the point color representation according to different attributes. Additionally, you can enable or disable Animations, Audio, and Shaking effects to customize the visualization experience.

3. Filter Effects:<br/>
	Changing the magnitude or depth filters updates both the map and the line chart. Additionally, selecting a new Color By option updates the point colors and the legend.

4. Line Chart: <br/>
	Located at the bottom of the screen, the visualization displays a time-series analysis of earthquake events. The X-axis represents Magnitude, Depth, or Duration based on user selection, while the Y-axis shows the number of earthquakes.

## Design Sketches and Justifications
We didn't make a sketch for every feature, with most sketches being made in the first week of work.
![Sketch 1: Interactive Map](images/documentation/sketch-1.jpg)
*By Jasmine, this sketch shows the placement for the timeline in relation to the leaflet map. It includes the event count at the bottom, a play button for the timeline animation, and darker divs for dragging and extending the time range.*

![Sketch 2: Filter Panel](images/documentation/sketch-2.jpg)
*By Jasmine, a general sketch for the vibe of the application. Areas drawn without much thought into what would go into them, focusing on composition rather than functionality.*

![Sketch 3: Line Chart](images/documentation/sketch-3.png)
*By Rashi, the first draft of the visualisation's bottom histogram. Originally planned to be a bar chart with a dropdown x-axis label.*

![Sketch 4: Timeline Animation](images/documentation/sketch-4.jpg)
*By Jasmine, a revision suggestion for Ishwarya's work on the color by dropdown input in the sidebar. Originally there were dots for each color for magnitude instead of a gradient legend. Dots work well for the types of category, but a gradient might be more helpful for quantitative information. This was never implemented, and all color by options use dot legends.*

## Discoveries
While the seismic activities appear to be distributed relatively uniformly across all the tectonic plates, a clear pattern emerges for major earthquakes. Earthquakes with magnitudes above 6.0 occur more frequently on the Pacific, Australian, and South American Plates, indicating that these regions experience more severe seismic activity than the others.

Found that in 2009 Europe initially went from several small magnitude earthquakes, to a notable drop in activity, to suddenly a handful of several high-magnitude earthquakes.

It can be seen that the United States has experienced a notable number of earthquakes caused by different geological factors, such as rock bursts and explosions. These types of activities have been more prevalent in the USA compared to other parts of the world.

Before the month of march in 2011, there were very few to almost no earthquakes recorded above 5.0 magnitude around Japan. However, starting from march, we observed a dramatic spike in activity, with hundreds of earthquakes originating from the east coast of Japan. This aligns perfectly with the 2011 Tohoku earthquake, an event that triggered hundreds of aftershocks/quakes. This visualization highlights how major earthquakes can lead to prolonged seismic disturbances in affected regions.

The line chart reveals a distinct pattern in earthquake depths. It is noticeable that, regardless of magnitude, most earthquakes occur at a depth of around 10 km, with a secondary peak of around 30 km. This suggests that the tectonic movements usually happen in earth's upper crust.

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
You can also access it by visiting the hosted site <br/> Link to site: https://dv-2025-project2.netlify.app/

## Demo Video
https://youtu.be/6tEtrOu1Ifs



[![YouTube](http://i.ytimg.com/vi/6tEtrOu1Ifs/hqdefault.jpg)](https://www.youtube.com/watch?v=6tEtrOu1Ifs)

## Future 

## Team Contributions

### Iswarya Mikkili
- Implemented the color by option filter in the left sidebar which changes the colors of the quakes on the map along with the legend to explain 
- Added the tooltip which explains the details when mouse hovered over the data points on the map. 
### Jasmine Mogadam
- Implemented timeline bar selector, specifically: play button, speed up [x1,x2,x3], and time metadata (specific date range, event count, days/second)
- Added a loading bar to enhance user experience while waiting for the map to draw
- Animated dots as they are filtered by the timeline
- Created filtering framework to make adding new filters easy
- Project Management
### Rashi Loni
- Implemented level 3 of the project by creating a visualization to help understand frequencies of earthquakes by depth, magnitude, and duration.
- Recorded the demo video and researched to find a formula to estimate duration.
### Samraysh Pellakur
- Downloaded the dataset and organised them in a fashion that made accessing them easy
- Implemented Range Sliders for interactive filtering of earthquakes based on magnitude and depth, allowing users to refine their data view dynamically.
- Enhanced Timeline Animation with visual and audio effects, along with dedicated control buttons, to create a more immersive and engaging experience while exploring seismic activity over time.
### Tulasi Rama Raju Chittiraju
- Implemented a drop down that lists the different basemap options for the map background, enabling more customization for the map visual.
- Added a side panel menu bar to house the basemap selection options and to enlist the data sources and references. 
