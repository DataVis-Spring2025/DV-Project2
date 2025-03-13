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

        // Make custom range element
        const range = document.createElement('div');
        range.style.position = 'absolute';
        range.style.left = '50px';
        range.style.width = '200px';
        range.style.height = this.height + 'px';
        range.style.backgroundColor = '#ddd';
        range.style.cursor = 'pointer';

        const leftHandle = document.createElement('div');
        leftHandle.style.position = 'absolute';
        leftHandle.style.left = '0';
        leftHandle.style.top = '0';
        leftHandle.style.width = '10px';
        leftHandle.style.height = '100%';
        leftHandle.style.backgroundColor = '#aaa';
        leftHandle.style.cursor = 'ew-resize';

        const rightHandle = document.createElement('div');
        rightHandle.style.position = 'absolute';
        rightHandle.style.right = '0';
        rightHandle.style.top = '0';
        rightHandle.style.width = '10px';
        rightHandle.style.height = '100%';
        rightHandle.style.backgroundColor = '#aaa';
        rightHandle.style.cursor = 'ew-resize';

        range.appendChild(leftHandle);
        range.appendChild(rightHandle);
        timelineContainer.appendChild(playPauseButton);
        timelineContainer.appendChild(range);

        playPauseButton.addEventListener('click', () => this.togglePlayPause(playPauseButton));
        leftHandle.addEventListener('mousedown', (e) => this.startDrag(e, 'left', range));
        rightHandle.addEventListener('mousedown', (e) => this.startDrag(e, 'right', range));
        range.addEventListener('mousedown', (e) => this.startDrag(e, 'move', range));
        document.addEventListener('mousemove', (e) => this.onDrag(e, range));
        document.addEventListener('mouseup', () => this.endDrag());

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

    togglePlayPause(button) {
        this.isPlaying = !this.isPlaying;
        button.innerHTML = this.isPlaying ? pauseIcon : playIcon;
        //unimplemented: handle play/pause toggle
        this.filter();
    }

    startDrag(e, type, range) {
        // ignore range drag if draggin a side handle
        if(this.isDragging && this.type !== 'move') return; 
        this.isDragging = true;
        this.dragType = type;
        this.startX = e.clientX;
        this.startWidth = range.offsetWidth;
        this.startLeft = range.offsetLeft;
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
            if (newWidth > 0) {
                range.style.left = newLeft + 'px';
                range.style.width = newWidth + 'px';
            }
        } else if (this.dragType === 'right') {
            let newWidth = this.startWidth + dx;
            if ((this.startLeft + newWidth) > (this.width + this.padding)) {
                newWidth = (this.width + this.padding) - this.startLeft;
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
    }

    endDrag() {
        if (this.isDragging) {
            this.isDragging = false;
            this.filter();
        }
    }
}