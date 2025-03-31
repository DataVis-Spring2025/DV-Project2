const playIcon = `<i class="bi bi-play-fill"></i>`
const pauseIcon = `<i class="bi bi-pause-fill"></i>`

class Timeline {
    constructor(data, initialTimelineWidth) {
        this.data = data;
        this.filter = () => { console.log("timeline filter called before override"); };
        this.isPlaying = false;
        this.isDragging = false;
        this.dragType = null;
        this.startX = 0;
        this.startWidth = 0;
        this.startLeft = 0;
        this.padding = 50;
        this.width = window.innerWidth - this.padding * 2;
        this.height = 50;
        this.tickSpacing = 100;
        this.tickFormat = "%b %Y"; // %B month, %Y Year
        this.minDate = new Date('1000-01-01T00:00:00.000Z');
        this.maxDate = new Date('9999-01-01T00:00:00.000Z');
        this.selectedYear = null;  // Track selected year
        this.speed = 30000; // 30 seconds
        this.playInterval = null;
        this.speedMultiplier = 1;
        this.handleWidth = 10;
        this.playPauseButton = null;
        this.infoDisplay = null; // Reference to the info display div
        this.lastFrameTime = null; // Track the last frame time for days per second calculation
        this.lastLeftPosition = null; // Track the last left position of the range

        // Set initial timeline width and calculate min/max dates
        this.initialTimelineWidth = initialTimelineWidth || 180; // Default to 180px if not provided
        this.calculateInitialDateRange();

        this.initTimeline();
        this.updateInfoDisplay(document.querySelector('#timeline div')); // Ensure info display is updated on init
    }

    calculateInitialDateRange() {
        const minDate = d3.min(this.data, d => d.parsedTime);
        const maxDate = d3.max(this.data, d => d.parsedTime);
        const totalDuration = maxDate - minDate;
        const initialDuration = (this.initialTimelineWidth / (this.width + this.padding * 2)) * totalDuration;

        this.minDate = minDate;
        this.maxDate = minDate + initialDuration;
    }

    // create all the html elements and setup event listeners
    initTimeline() {
        const timelineContainer = document.querySelector('#timeline');
        timelineContainer.style.position = 'relative';
        timelineContainer.style.width = '100%';
        timelineContainer.style.height = this.height + 'px';
        timelineContainer.style.border = '1px solid #ccc';
        timelineContainer.style.margin = '20px 0';

        // Info display div
        const infoDisplay = document.createElement('div');
        infoDisplay.style.display = 'flex';
        infoDisplay.style.alignItems = 'center';
        infoDisplay.style.justifyContent = 'flex-start'; // Left-align all elements
        infoDisplay.style.marginBottom = '-20px';
        infoDisplay.innerHTML = `
            <span id="date-range" style="width: 25vw; padding: 0 10px; text-align: left;">Selected Range: N/A</span>
            <span id="count-displayed" style="width: 25vw; padding: 0 10px; text-align: left;">Events Displayed: N/A</span>
            <span id="days-per-second" style="width: 25vw; padding: 0 10px; text-align: left;">Speed: N/A days/second</span>
        `;
        timelineContainer.parentElement.insertBefore(infoDisplay, timelineContainer);
        this.infoDisplay = infoDisplay;

        // Play/Pause button
        const playPauseButton = document.createElement('button');
        playPauseButton.innerHTML = '▶'; // Play icon
        playPauseButton.style.position = 'absolute';
        playPauseButton.style.left = '10px';
        playPauseButton.style.top = '10px';
        this.playPauseButton = playPauseButton;

        // Range div (draggable timeline range)
        const range = document.createElement('div');
        range.style.position = 'absolute';
        range.style.left = '50px';
        range.style.width = this.initialTimelineWidth + 'px'; // Use initialTimelineWidth
        range.style.height = this.height + 'px';
        range.style.backgroundColor = '#ddd';
        range.style.cursor = 'pointer';

        // Handle for left side
        const leftHandle = document.createElement('div');
        leftHandle.style.position = 'absolute';
        leftHandle.style.left = '-10px';
        leftHandle.style.top = '0';
        leftHandle.style.width = this.handleWidth + 'px';
        leftHandle.style.height = '100%';
        leftHandle.style.backgroundColor = '#aaa';
        leftHandle.style.cursor = 'ew-resize';
        leftHandle.style.borderRight = '2px solid #555';

        // Handle for right side
        const rightHandle = document.createElement('div');
        rightHandle.style.position = 'absolute';
        rightHandle.style.right = '-10px';
        rightHandle.style.top = '0';
        rightHandle.style.width = this.handleWidth + 'px';
        rightHandle.style.height = '100%';
        rightHandle.style.backgroundColor = '#aaa';
        rightHandle.style.cursor = 'ew-resize';
        rightHandle.style.borderLeft = '2px solid #555';

        // Add draggable icon in center
        const dragIcon = document.createElement('div');
        dragIcon.innerHTML = '<i class="bi bi-grip-vertical"></i>';
        dragIcon.style.position = 'absolute';
        dragIcon.style.left = '50%';
        dragIcon.style.top = '50%';
        dragIcon.style.transform = 'translate(-50%, -50%)';
        dragIcon.style.cursor = 'move';

        range.appendChild(leftHandle);
        range.appendChild(dragIcon);
        range.appendChild(rightHandle);
        timelineContainer.appendChild(playPauseButton);
        timelineContainer.appendChild(range);

        // Speed control button
        const speedButton = document.createElement('button');
        speedButton.innerHTML = 'x1';
        speedButton.style.position = 'absolute';
        speedButton.style.right = '10px';
        speedButton.style.top = '10px';

        timelineContainer.appendChild(speedButton);

        // Event listeners
        playPauseButton.addEventListener('click', () => this.togglePlayPause());
        leftHandle.addEventListener('mousedown', (e) => this.startDrag(e, 'left', range));
        rightHandle.addEventListener('mousedown', (e) => this.startDrag(e, 'right', range));
        range.addEventListener('mousedown', (e) => this.startDrag(e, 'move', range));
        document.addEventListener('mousemove', (e) => this.onDrag(e, range));
        document.addEventListener('mouseup', () => this.endDrag());
        speedButton.addEventListener('click', () => this.toggleSpeed(speedButton));

        // Time scale setup with D3
        const parseTime = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
        const timeValues = this.data.map(d => parseTime(d.time));

        const timeScale = d3.scaleTime()
            .domain(d3.extent(timeValues))
            .range([0, this.width]);

        const xAxis = d3.axisBottom(timeScale)
            .tickFormat(d3.timeFormat(this.tickFormat))
            .tickValues([timeScale.domain()[0], ...timeScale.ticks(Math.max(1, Math.floor(this.width / this.tickSpacing))), timeScale.domain()[1]]);

        const svg = d3.select(timelineContainer)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .style("margin-left", this.padding + "px")
            .style("overflow", "visible")
            .attr("transform", `translate(0,${this.height})`);

        const xAxisG = svg.append("g")
            .call(xAxis);

        xAxisG.append("text")
            .attr("y", 30)
            .attr("x", this.width / 2)
            .attr("text-anchor", "middle");

        // Remove last tick mark
        const ticks = xAxisG.selectAll(".tick");
        ticks.filter((_, i) => i === ticks.size() - 2).remove();
    }

    // Method to select the year and filter the timeline data
    setSelectedYear(year) {
        this.selectedYear = year;
        this.filterByYear(year); // Filter the data by the selected year
    }

    // Filter the data based on the selected year
    filterByYear(year) {
        const filteredData = this.data.filter(d => {
            const date = new Date(d.time);
            return date.getFullYear() === year;
        });

        console.log(`Data filtered for year: ${year}`);
        this.updateTimelineForYear(filteredData);
    }

    // Update the timeline's min and max date based on the filtered data
    updateTimelineForYear(filteredData) {
        const parseTime = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
        const timeValues = filteredData.map(d => parseTime(d.time));

        this.minDate = d3.min(timeValues);
        this.maxDate = d3.max(timeValues);
        console.log(this.minDate);
        // After filtering, update the range and rerun any other logic
        this.updateDateRange();
        console.log(this.minDate);
        // Re-render or update any necessary UI components
    }

    // Your other methods for play/pause, speed, etc.

    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        this.playPauseButton.innerHTML = this.isPlaying ? pauseIcon : playIcon;
        if (this.isPlaying) {
            this.startPlaying();
        } else {
            this.stopPlaying();
        }
        this.filter(); // Trigger filter to update map visuals
    }

    toggleSpeed(button) {
        if (this.speedMultiplier === 1) {
            this.speedMultiplier = 2;
            button.innerHTML = 'x2';
        } else if (this.speedMultiplier === 2) {
            this.speedMultiplier = 3;
            button.innerHTML = 'x3';
        } else {
            this.speedMultiplier = 1;
            button.innerHTML = 'x1';
        }
    }

    // move the range to the right by 1 pixel every interval
    startPlaying() {
        if (this.playInterval) return;

        const range = document.querySelector('#timeline div');
        if (range.offsetLeft + range.offsetWidth >= this.width + this.padding) {
            range.style.left = this.padding + 'px';
        }

        this.playInterval = setInterval(() => {
            let newLeft = range.offsetLeft + this.speedMultiplier;
            // once it hits the end, stop playing
            if (newLeft + range.offsetWidth > this.width + this.padding) {
                this.stopPlaying();
                range.style.left = this.width + this.padding - range.offsetWidth + 'px';
                this.togglePlayPause();
            } else {
                // move the range to the right
                range.style.left = newLeft + 'px';
            }
            // update min/max and re-run leafletMap filter
            this.updateDateRange(range);
        }, this.speed / (this.width + this.padding));
    }

    stopPlaying() {
        // clean up interval to pause animation
        clearInterval(this.playInterval);
        this.playInterval = null;
    }

    updateDateRange(range) {
        const rangeWidth = range.offsetWidth;
        const left = range.offsetLeft;
        const right = left + rangeWidth;
        const totalWidth = this.width + this.padding * 2;
        const minDate = d3.min(this.data, d => d.parsedTime);
        const maxDate = d3.max(this.data, d => d.parsedTime);

        this.minDate = Math.floor(minDate + ((left - this.padding) / totalWidth) * (maxDate - minDate));
        this.maxDate = Math.floor(minDate + ((right - this.padding) / totalWidth) * (maxDate - minDate));
        this.filter();
        this.updateInfoDisplay(range);
    }

    updateInfoDisplay(range) {
        const dateRangeElement = this.infoDisplay.querySelector('#date-range');
        const countDisplayedElement = this.infoDisplay.querySelector('#count-displayed');
        const daysPerSecondElement = this.infoDisplay.querySelector('#days-per-second');

        // Update Selected Range
        const minDateFormatted = new Date(this.minDate).toLocaleDateString();
        const maxDateFormatted = new Date(this.maxDate).toLocaleDateString();
        dateRangeElement.textContent = `Selected Range: ${minDateFormatted} - ${maxDateFormatted}`;

        // Update Events Displayed
        const filteredData = this.data.filter(d => {
            const date = new Date(d.time);
            return date >= this.minDate && date <= this.maxDate;
        });
        countDisplayedElement.textContent = `Events Displayed: ${filteredData.length}`;

        // Calculate and update speed
        const currentTime = performance.now();
        if (this.isPlaying && this.lastFrameTime !== null && this.lastLeftPosition !== null) {
            const elapsedTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
            const rangeLeft = range.offsetLeft;
            const totalWidth = this.width + this.padding * 2;
            const totalDays = (d3.max(this.data, d => d.parsedTime) - d3.min(this.data, d => d.parsedTime)) / (1000 * 60 * 60 * 24); // Total days in dataset
            const daysPerPixel = totalDays / totalWidth;
            const pixelsMoved = Math.abs(rangeLeft - this.lastLeftPosition);
            const daysPerSecond = (pixelsMoved * daysPerPixel) / elapsedTime;
            daysPerSecondElement.textContent = `Speed: ${daysPerSecond.toFixed(2)} days/second`;
        } else {
            daysPerSecondElement.textContent = `Speed: 0.00 days/second`;
        }

        this.lastFrameTime = currentTime;
        this.lastLeftPosition = range.offsetLeft;
    }

    startDrag(e, type, range) {
        // ignore range drag if dragging a side handle
        if(this.isDragging && this.type !== 'move') return; 
        this.isDragging = true;
        this.dragType = type;
        this.startX = e.clientX;
        this.startWidth = range.offsetWidth;
        this.startLeft = range.offsetLeft;
        
        // Stop playing and toggle play/pause button
        if (this.isPlaying) {
            this.togglePlayPause();
        }
    }

    onDrag(e, range) {
        if (!this.isDragging) return;

        const dx = e.clientX - this.startX;

        if (this.dragType === 'left') {
            let newLeft = this.startLeft + dx;
            let newWidth = this.startWidth - dx;
            if (newLeft < this.padding) {
                newLeft = this.padding;
                newWidth = this.startWidth + (this.startLeft - this.padding);
            }
            if (newLeft + this.handleWidth >= range.offsetLeft + range.offsetWidth) {
                newLeft = range.offsetLeft + range.offsetWidth - this.handleWidth;
                newWidth = this.startWidth + (this.startLeft - newLeft);
            }
            if (newWidth > 0) {
                range.style.left = newLeft + 'px';
                range.style.width = newWidth + 'px';
            }
        } else if (this.dragType === 'right') {
            let newWidth = this.startWidth + dx;
            if ((this.startLeft + newWidth) > (this.width + this.padding)) {
                newWidth = (this.width + this.padding) - this.startLeft;
            }
            if (newWidth <= this.handleWidth) {
                newWidth = this.handleWidth;
            }
            if (newWidth > 0) {
                range.style.width = newWidth + 'px';
            }
        } else if (this.dragType === 'move') {
            let newLeft = this.startLeft + dx;
            if (newLeft < this.padding) {
                newLeft = this.padding;
            } else if ((newLeft + range.offsetWidth) > (this.width + this.padding)) {
                newLeft = (this.width + this.padding) - range.offsetWidth;
            }
            range.style.left = newLeft + 'px';
        }

        // update min/max
        const rangeWidth = range.offsetWidth;
        const left = range.offsetLeft;
        const right = left + rangeWidth;
        const totalWidth = this.width + this.padding * 2;
        const minDate = d3.min(this.data, d => d.parsedTime);
        const maxDate = d3.max(this.data, d => d.parsedTime);

        this.minDate = Math.floor(minDate + ((left - this.padding) / totalWidth) * (maxDate - minDate));
        this.maxDate = Math.floor(minDate + ((right - this.padding) / totalWidth) * (maxDate - minDate));
        this.updateDateRange(range);
        this.updateInfoDisplay(range);
    }

    endDrag() {
        if (this.isDragging) {
            this.isDragging = false;
            this.filter();
            this.updateInfoDisplay(document.querySelector('#timeline div'));
        }
    }

    getMinDate() {
        return this.minDate;
    }

    getMaxDate() {
        return this.maxDate;
    }
}