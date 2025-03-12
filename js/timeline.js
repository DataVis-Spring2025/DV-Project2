class Timeline {
    constructor(leafletMap) {
        this.leafletMap = leafletMap;
        this.isPlaying = false;
        this.isDragging = false;
        this.dragType = null;
        this.startX = 0;
        this.startWidth = 0;
        this.startLeft = 0;

        this.initTimeline();
    }

    initTimeline() {
        const timelineContainer = document.querySelector('#timeline');
        timelineContainer.style.position = 'relative';
        timelineContainer.style.width = '100%';
        timelineContainer.style.height = '50px';
        timelineContainer.style.border = '1px solid #ccc';
        timelineContainer.style.margin = '20px 0';

        const playPauseButton = document.createElement('button');
        playPauseButton.innerText = 'Play';
        playPauseButton.style.position = 'absolute';
        playPauseButton.style.left = '10px';
        playPauseButton.style.top = '10px';

        const range = document.createElement('div');
        range.style.position = 'absolute';
        range.style.left = '50px';
        range.style.top = '10px';
        range.style.width = '200px';
        range.style.height = '30px';
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
    }

    togglePlayPause(button) {
        this.isPlaying = !this.isPlaying;
        button.innerText = this.isPlaying ? 'Pause' : 'Play';
        //unimplemented: handle play/pause toggle
        this.leafletMap.updateVis();
    }

    startDrag(e, type, range) {
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
            const newLeft = this.startLeft + dx;
            const newWidth = this.startWidth - dx;
            if (newWidth > 0) {
                range.style.left = newLeft + 'px';
                range.style.width = newWidth + 'px';
            }
        } else if (this.dragType === 'right') {
            const newWidth = this.startWidth + dx;
            if (newWidth > 0) {
                range.style.width = newWidth + 'px';
            }
        } else if (this.dragType === 'move') {
            range.style.left = this.startLeft + dx + 'px';
        }
    }

    endDrag() {
        if (this.isDragging) {
            this.isDragging = false;
            //unimplemented: handle drag end
            this.leafletMap.updateVis();
        }
    }
}