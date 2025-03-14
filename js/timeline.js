const playIcon = `<i class="bi bi-play-fill"></i>`
const pauseIcon = `<i class="bi bi-pause-fill"></i>`

class Timeline {
    constructor(data) {
        this.data = data;
        this.filter = () => {console.log("timeline filter called before override")};
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
        this.speed = 30000; // 30 seconds
        this.playInterval = null;
        this.speedMultiplier = 1;
        this.handleWidth = 10;
        this.playPauseButton = null;

        this.initTimeline();
    }

    // create all the html elements and setup event listeners
    initTimeline() {
        const timelineContainer = document.querySelector('#timeline');
        timelineContainer.style.position = 'relative';
        timelineContainer.style.width = '100%';
        timelineContainer.style.height = this.height + 'px';
        timelineContainer.style.border = '1px solid #ccc';
        timelineContainer.style.margin = '20px 0';

        // silly toggle guy
        const playPauseButton = document.createElement('button');
        playPauseButton.innerHTML = playIcon;
        playPauseButton.style.position = 'absolute';
        playPauseButton.style.left = '10px';
        playPauseButton.style.top = '10px';
        this.playPauseButton = playPauseButton;

        // Make custom range element
        const range = document.createElement('div');
        range.style.position = 'absolute';
        range.style.left = '50px';
        range.style.width = '180px'; // Adjust width to exclude handles
        range.style.height = this.height + 'px';
        range.style.backgroundColor = '#ddd';
        range.style.cursor = 'pointer';

        const leftHandle = document.createElement('div');
        leftHandle.style.position = 'absolute';
        leftHandle.style.left = '-10px'; // Adjust position to exclude from range
        leftHandle.style.top = '0';
        leftHandle.style.width = this.handleWidth + 'px';
        leftHandle.style.height = '100%';
        leftHandle.style.backgroundColor = '#aaa';
        leftHandle.style.cursor = 'ew-resize';
        leftHandle.style.borderRight = '2px solid #555'; // Add right border

        const leftArrow = document.createElement('div');
        leftArrow.innerHTML = '<<';
        leftArrow.classList.add('drag-arrow');
        leftHandle.appendChild(leftArrow);

        const rightHandle = document.createElement('div');
        rightHandle.style.position = 'absolute';
        rightHandle.style.right = '-10px'; // Adjust position to exclude from range
        rightHandle.style.top = '0';
        rightHandle.style.width = this.handleWidth + 'px';
        rightHandle.style.height = '100%';
        rightHandle.style.backgroundColor = '#aaa';
        rightHandle.style.cursor = 'ew-resize';
        rightHandle.style.borderLeft = '2px solid #555'; // Add left border

        const rightArrow = document.createElement('div');
        rightArrow.innerHTML = '>>';
        rightArrow.classList.add('drag-arrow');
        rightHandle.appendChild(rightArrow);

        // Add draggable icon to the center of the range
        const dragIcon = document.createElement('div');
        dragIcon.innerHTML = '<i class="bi bi-grip-vertical"></i>';
        dragIcon.style.position = 'absolute';
        dragIcon.style.left = '50%';
        dragIcon.style.top = '50%';
        dragIcon.style.transform = 'translate(-50%, -50%)';
        dragIcon.style.cursor = 'move';

        range.appendChild(leftHandle);
        range.appendChild(dragIcon); // Append the drag icon to the range
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

        playPauseButton.addEventListener('click', () => this.togglePlayPause());
        leftHandle.addEventListener('mousedown', (e) => this.startDrag(e, 'left', range));
        rightHandle.addEventListener('mousedown', (e) => this.startDrag(e, 'right', range));
        range.addEventListener('mousedown', (e) => this.startDrag(e, 'move', range));
        document.addEventListener('mousemove', (e) => this.onDrag(e, range));
        document.addEventListener('mouseup', () => this.endDrag());
        speedButton.addEventListener('click', () => this.toggleSpeed(speedButton));

        // use d3 to make a time scale
        // Parse the ISO-formatted timestamps
        const parseTime = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");

        // Convert data.time strings to Date objects
        const timeValues = this.data.map(d => parseTime(d.time));

        // Create the time scale
        const timeScale = d3.scaleTime()
            .domain(d3.extent(timeValues))
            .range([0, this.width]); // Replace width with your desired pixel value

        // Create the axis with a label
        const xAxis = d3.axisBottom(timeScale)
        .tickFormat(d3.timeFormat(this.tickFormat)) // still format
        .tickValues([ // shows more ticks depending on screen size
            timeScale.domain()[0],
            ...timeScale.ticks(Math.max(1, Math.floor(this.width / this.tickSpacing))),
            timeScale.domain()[1]
        ]);

        const svg = d3.select(timelineContainer)
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .style("margin-left", this.padding + "px")
        .style("overflow", "visible")
        .attr("transform", `translate(0,${this.height})`);

        const xAxisG = svg.append("g") // Position at bottom
        .call(xAxis);

        xAxisG.append("text")
        .attr("y", 30) // Move label below axis
        .attr("x", this.width / 2) // Center label
        .attr("text-anchor", "middle");

        // Remove the last tick mark after rendering (prevent overlap)
        const ticks = xAxisG.selectAll(".tick");
        ticks.filter((_, i) => i === ticks.size() - 2).remove();
    }

    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        this.playPauseButton.innerHTML = this.isPlaying ? pauseIcon : playIcon;
        if (this.isPlaying) {
            this.startPlaying();
        } else {
            this.stopPlaying();
        }
        this.filter();
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
        const minDate = d3.min(this.data, d => new Date(d.time));
        const maxDate = d3.max(this.data, d => new Date(d.time));
        this.minDate = new Date(minDate.getTime() + (left - this.padding) / totalWidth * (maxDate.getTime() - minDate.getTime()));
        this.maxDate = new Date(minDate.getTime() + (right - this.padding) / totalWidth * (maxDate.getTime() - minDate.getTime()));
        this.filter();
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
        const minDate = d3.min(this.data, d => new Date(d.time));
        const maxDate = d3.max(this.data, d => new Date(d.time));
        this.minDate = new Date(minDate.getTime() + (left - this.padding) / totalWidth * (maxDate.getTime() - minDate.getTime()));
        this.maxDate = new Date(minDate.getTime() + (right - this.padding) / totalWidth * (maxDate.getTime() - minDate.getTime()));
        this.updateDateRange(range);
    }

    endDrag() {
        if (this.isDragging) {
            this.isDragging = false;
            this.filter();
        }
    }
}