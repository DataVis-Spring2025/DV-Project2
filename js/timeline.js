const playIcon = `<i class="bi bi-play-fill"></i>`;
const pauseIcon = `<i class="bi bi-pause-fill"></i>`;

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
        this.tickFormat = "%b %Y";
        this.selectedYear = null;
        this.speed = 30000;
        this.playInterval = null;
        this.speedMultiplier = 1;
        this.handleWidth = 10;
        this.playPauseButton = null;
        this.rangeElement = null;

        this.initialTimelineWidth = initialTimelineWidth || 180;
        this.calculateInitialDateRange();
        this.initTimeline();
    }

    calculateInitialDateRange() {
        const minDate = d3.min(this.data, d => d.parsedTime);
        const maxDate = d3.max(this.data, d => d.parsedTime);
        const totalDuration = maxDate - minDate;
        const initialDuration = (this.initialTimelineWidth / (this.width + this.padding * 2)) * totalDuration;

        this.minDate = minDate;
        this.maxDate = minDate + initialDuration;
    }

    initTimeline() {
        const timelineContainer = document.querySelector('#timeline');
        timelineContainer.style.position = 'relative';
        timelineContainer.style.width = '100%';
        timelineContainer.style.height = this.height + 'px';
        timelineContainer.style.border = '1px solid #ccc';
        timelineContainer.style.margin = '20px 0';

        // Play/Pause button
        this.playPauseButton = this.createButton(playIcon, { left: '10px', top: '10px' }, () => this.togglePlayPause());

        // Range div (draggable timeline range)
        const range = document.createElement('div');
        range.style.position = 'absolute';
        range.style.left = '50px';
        range.style.width = this.initialTimelineWidth + 'px';
        range.style.height = this.height + 'px';
        range.style.backgroundColor = '#ddd';
        range.style.cursor = 'pointer';

        // Left Handle
        const leftHandle = this.createHandle('-10px', 'border-right: 2px solid #555;');
        // Right Handle
        const rightHandle = this.createHandle('auto', 'border-left: 2px solid #555; right: -10px;');

        // Center Drag Icon
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
        timelineContainer.appendChild(this.playPauseButton);
        timelineContainer.appendChild(range);

        // Speed Control Button
        const speedButton = this.createButton('x1', { right: '80px', top: '10px' }, () => this.toggleSpeed(speedButton));
        timelineContainer.appendChild(speedButton);

        // **New Buttons for Resizing Timeline**
        const increaseButton = this.createButton('+', { right: '50px', top: '10px' }, () => this.adjustRangeSize(20));
        const decreaseButton = this.createButton('-', { right: '20px', top: '10px' }, () => this.adjustRangeSize(-20));
        const fullButton = this.createButton('Full', { right: '120px', top: '10px' }, () => this.expandToFullRange());

        timelineContainer.appendChild(increaseButton);
        timelineContainer.appendChild(decreaseButton);
        timelineContainer.appendChild(fullButton);

        // Event listeners
        leftHandle.addEventListener('mousedown', (e) => this.startDrag(e, 'left', range));
        rightHandle.addEventListener('mousedown', (e) => this.startDrag(e, 'right', range));
        range.addEventListener('mousedown', (e) => this.startDrag(e, 'move', range));
        document.addEventListener('mousemove', (e) => this.onDrag(e, range));
        document.addEventListener('mouseup', () => this.endDrag());

        this.rangeElement = range;

       const parseTime = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
const timeValues = this.data.map(d => parseTime(d.time));

const timeScale = d3.scaleTime()
    .domain(d3.extent(timeValues))
    .range([0, this.width]);

// Major axis with standard tick format
const xAxis = d3.axisBottom(timeScale)
    .tickFormat(d3.timeFormat(this.tickFormat))
    .tickValues([timeScale.domain()[0], ...timeScale.ticks(Math.max(1, Math.floor(this.width / this.tickSpacing))), timeScale.domain()[1]]);

// Generate minor tick values for odd-numbered years
const allYears = d3.timeYear.range(timeScale.domain()[0], timeScale.domain()[1]);
const minorTickValues = allYears.filter(d => d.getFullYear() % 2 !== 0);

const xAxisMinor = d3.axisBottom(timeScale)
    .tickFormat("") // Hide labels for minor ticks
    .tickSize(5) // Shorter tick length
    .tickValues(minorTickValues); // Only show for odd-numbered years

const svg = d3.select(timelineContainer)
    .append("svg")
    .attr("width", this.width)
    .attr("height", this.height + 10) // Add extra space for ticks
    .style("margin-left", this.padding + "px")
    .style("overflow", "visible")
    .attr("transform", `translate(0,${this.height})`);

const xAxisG = svg.append("g").call(xAxis);

// Append minor tick axis below the major one
svg.append("g")
    .attr("class", "minor-ticks")
    .call(xAxisMinor);

        // Remove last tick mark
        const ticks = xAxisG.selectAll(".tick");
        ticks.filter((_, i) => i === ticks.size() - 2).remove();
    }

    createButton(text, style, callback) {
        const button = document.createElement('button');
        button.innerHTML = text;
        Object.assign(button.style, {
            position: 'absolute',
            ...style
        });
        button.addEventListener('click', callback);
        return button;
    }

    createHandle(left, extraStyles = '') {
        const handle = document.createElement('div');
        handle.style.position = 'absolute';
        handle.style.left = left;
        handle.style.top = '0';
        handle.style.width = this.handleWidth + 'px';
        handle.style.height = '100%';
        handle.style.backgroundColor = '#aaa';
        handle.style.cursor = 'ew-resize';
        handle.style.cssText += extraStyles;
        return handle;
    }

    adjustRangeSize(delta) {
        let newWidth = this.rangeElement.offsetWidth + delta;
        if (newWidth > this.width) newWidth = this.width;
        if (newWidth < this.handleWidth * 2) newWidth = this.handleWidth * 2;

        this.rangeElement.style.width = newWidth + 'px';
        this.updateDateRange(this.rangeElement);
    }

    expandToFullRange() {
        this.rangeElement.style.width = this.width + 'px';
        this.rangeElement.style.left = this.padding + 'px';
        this.updateDateRange(this.rangeElement);
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
        this.speedMultiplier = this.speedMultiplier === 1 ? 2 : this.speedMultiplier === 2 ? 3 : 1;
        button.innerHTML = `x${this.speedMultiplier}`;
    }

    startPlaying() {
        if (this.playInterval) return;

        const range = this.rangeElement;
        if (range.offsetLeft + range.offsetWidth >= this.width + this.padding) {
            range.style.left = this.padding + 'px';
        }

        this.playInterval = setInterval(() => {
            let newLeft = range.offsetLeft + this.speedMultiplier;
            if (newLeft + range.offsetWidth > this.width + this.padding) {
                this.stopPlaying();
                range.style.left = this.width + this.padding - range.offsetWidth + 'px';
                this.togglePlayPause();
            } else {
                range.style.left = newLeft + 'px';
            }
            this.updateDateRange(range);
        }, this.speed / (this.width + this.padding));
    }

    stopPlaying() {
        clearInterval(this.playInterval);
        this.playInterval = null;
    }

    updateDateRange(range) {
        const rangeWidth = range.offsetWidth;
        const left = range.offsetLeft;
        const right = left + rangeWidth;
        const minDate = d3.min(this.data, d => d.parsedTime);
        const maxDate = d3.max(this.data, d => d.parsedTime);

        this.minDate = minDate + ((left - this.padding) / this.width) * (maxDate - minDate);
        this.maxDate = minDate + ((right - this.padding) / this.width) * (maxDate - minDate);
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
        const minDate = d3.min(this.data, d => d.parsedTime);
        const maxDate = d3.max(this.data, d => d.parsedTime);

        this.minDate = Math.floor(minDate + ((left - this.padding) / totalWidth) * (maxDate - minDate));
        this.maxDate = Math.floor(minDate + ((right - this.padding) / totalWidth) * (maxDate - minDate));
        this.updateDateRange(range);
    }

    endDrag() {
        if (this.isDragging) {
            this.isDragging = false;
            this.filter();
        }
    }
}