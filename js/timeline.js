const playIcon = `<i class="bi bi-play-fill"></i>`;
const pauseIcon = `<i class="bi bi-pause-fill"></i>`;

class Timeline {
    constructor(data, initialTimelineWidth) {
        this.data = data;
        this.filter = () => { console.log("timeline filter called before override"); };
        this.isPlaying = false;
        this.isDragging = false;
        this.dragType = null;
        this.startX = 220;
        this.startWidth = 220;
        this.startLeft = 220;
        this.padding = 220;
        this.width = (window.innerWidth) - 270;
        this.height = 50;
        this.tickSpacing = 50;
        this.tickFormat = "%b %Y";
        this.selectedYear = null;
        this.speed = 30000;
        this.playInterval = null;
        this.speedMultiplier = 1;
        this.handleWidth = 10;
        this.playPauseButton = null;
        this.rangeElement = null;
        this.isMuted = false; 
        this.audio = new Audio('052256_cracking-earthquake-cracking-soil-cracking-stone-86770.mp3'); // Replace with your MP3 file path
        this.audio.loop = true; 
        this.infoDisplay = null; // Reference to the info display div
        this.lastFrameTime = null; // Track the last frame time for days per second calculation
        this.lastLeftPosition = null; // Track the last left position of the range

        this.initialTimelineWidth = initialTimelineWidth || 180;
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

    initTimeline() {
        const timelineContainer = document.querySelector('#timeline');
        timelineContainer.style.position = 'relative';
        timelineContainer.style.width = '100%';
        timelineContainer.style.height = this.height + 'px';
        // timelineContainer.style.border = '1px solid #ccc';
        timelineContainer.style.margin = '20px 0';

        const timelineButtons = document.createElement('div');
        timelineButtons.style.position = 'absolute';
        timelineButtons.style.top = '0px';
        timelineButtons.style.left = '10px';
        timelineButtons.style.zIndex = "1000";
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
        this.playPauseButton = this.createButton(playIcon, { top: '10px' }, () => this.togglePlayPause());

        // Range div (draggable timeline range)
        const range = document.createElement('div');
        range.style.position = 'absolute';
        range.style.left = '220px';
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
        
        timelineButtons.appendChild(this.playPauseButton);
        timelineContainer.appendChild(range);

        // Speed Control Button
        const speedButton = this.createButton('x1', { left: '40px', top: '10px' }, () => this.toggleSpeed(speedButton));
        timelineButtons.appendChild(speedButton);

        // **New Buttons for Resizing Timeline**
        const increaseButton = this.createButton('+', { left: '80px', top: '10px' }, () => this.adjustRangeSize(10));
        const decreaseButton = this.createButton('-', { left: '110px', top: '10px' }, () => this.adjustRangeSize(-10));
        const fullButton = this.createButton('Full', { left: '140px', top: '10px' }, () => this.expandToFullRange());

        timelineButtons.appendChild(increaseButton);
        timelineButtons.appendChild(decreaseButton);
        timelineButtons.appendChild(fullButton);

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
    .tickValues([timeScale.domain()[1], ...timeScale.ticks(Math.max(1, Math.floor(this.width / this.tickSpacing))), timeScale.domain()[1]]);

// Generate minor tick values for odd-numbered years
const allYears = d3.timeYear.range(timeScale.domain()[0], timeScale.domain()[1]);
const minorTickValues = allYears.filter(d => d.getFullYear() % 2 !== 0);

const xAxisMinor = d3.axisBottom(timeScale)
    .tickFormat("") // Hide labels for minor ticks
    .tickSize(5) // Shorter tick length
    .tickValues(minorTickValues); // Only show for odd-numbered years

const svg = d3.select(timelineContainer)
    .append("svg")
    .attr("width", '500px')
    .attr("height", this.height + 10) // Add extra space for ticks
    .style("margin-left",  '220px')
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
        timelineContainer.appendChild(timelineButtons);
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
        if (newWidth < 10) newWidth = 10;

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
        this.filter(); // Trigger filter to update map visuals
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
    
            // Check if audio is enabled; stop audio if it's disabled
            if (!this.sidebar.audioEnabled) {
                this.muteAudio();
            } else if (this.sidebar.audioEnabled) {
                this.unmuteAudio();
            }

            if (!this.sidebar.shakeEnabled) {
                document.getElementById('my-map').classList.remove('shake');
                document.getElementById('level3').classList.remove('shake');
                document.getElementById('toggleSidebar').classList.remove('shake');
            } else if (this.sidebar.shakeEnabled) {
                document.getElementById('my-map').classList.add('shake');
                document.getElementById('level3').classList.add('shake');
                document.getElementById('toggleSidebar').classList.add('shake');
            }
        }, this.speed / (this.width + this.padding));
    
        console.log("Playing audio...");
        if (this.sidebar.audioEnabled) {
            this.audio.play();
        }
    }

    stopPlaying() {
        clearInterval(this.playInterval);
        this.playInterval = null;

        this.audio.pause();
        this.audio.currentTime = 0;
        document.getElementById('my-map').classList.remove('shake');
        document.getElementById('level3').classList.remove('shake'); 
        document.getElementById('toggleSidebar').classList.remove('shake');
    }

    muteAudio() {
        this.audio.muted = true;
    }
    
    unmuteAudio() {
        this.audio.muted = false;
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

    linkSidebar(sidebar) {
        this.sidebar = sidebar; // Link the sidebar to access the animation toggle state
      }
    getMinDate() {
        return this.minDate;
    }

    getMaxDate() {
        return this.maxDate;
    }
}