import { SliderRange } from './sliderRange.js';
import { loadData } from './loading.js';

function generateSliders(containerId, ranges, onSlideCallback) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id "${containerId}" not found.`);
        return;
    }

    ranges.forEach(range => {
        const sliderContainer = document.createElement("div");
        sliderContainer.id = range.id;
        container.appendChild(sliderContainer);

        new SliderRange({
            containerId: range.id,
            label: range.label,
            min: range.min,
            max: range.max,
            step: range.step,
            values: range.values,
            onSlide: onSlideCallback,
        });
    });
}

class Sidebar {
    constructor(containerId, data) {
        this.container = document.getElementById(containerId);
        this.data = data;

        // Define overall bounds as constants
        this.overallMagMin = d3.min(data, d => d.mag);
        this.overallMagMax = d3.max(data, d => d.mag);
        this.overallDepMin = d3.min(data, d => d.depth);
        this.overallDepMax = d3.max(data, d => d.depth);

        // Initialize form values with overall bounds
        this.magMin = this.overallMagMin;
        this.magMax = this.overallMagMax;
        this.depMin = this.overallDepMin;
        this.depMax = this.overallDepMax;

        this.filter = () => { console.log("Sidebar filter called before override"); };

        this.audioEnabled = true;
        this.init();
    }

    init() {
        const magnitudeSliderRangeId = "magnitude-slider-range";
        const depthSliderRangeId = "depth-slider-range";
        // Generate sliders dynamically
        generateSliders(this.container.id, [
            {
                id: magnitudeSliderRangeId,
                label: "Magnitude Range:",
                min: this.overallMagMin,
                max: this.overallMagMax,
                step: 0.5,
                values: [this.magMin, this.magMax],
            },
            {
                id: depthSliderRangeId,
                label: "Depth Range:",
                min: this.overallDepMin,
                max: this.overallDepMax,
                step: 1,
                values: [this.depMin, this.depMax],
            },
        ], (values, id) => {
            // Update form values when sliders are adjusted
            if (id === magnitudeSliderRangeId) {
                [this.magMin, this.magMax] = values;
            } else if (id === depthSliderRangeId) {
                [this.depMin, this.depMax] = values;
            }
            this.filter(); // Call the filter method
        });

        // Initialize dropdown
        // this.initYearDropdown();

        // Initialize sidebar toggle
        this.initSidebarToggle();

        // Initialize year selection
        // this.initYearSelection();

        this.initAudioToggle();
    }

    addElement(element) {
        this.container.appendChild(element);
    }

    initYearDropdown() {
        let yearSelect = document.getElementById("yearSelect");

        // Create the yearSelect element if it doesn't exist
        if (!yearSelect) {
            yearSelect = document.createElement("select");
            yearSelect.id = "yearSelect";
            this.container.appendChild(yearSelect);
        }

        const startYear = 2004;
        const endYear = 2025;

        for (let year = startYear; year <= endYear; year++) {
            const option = document.createElement("option");
            option.value = year.toString();
            option.textContent = year.toString();
            yearSelect.appendChild(option);
        }

        const rangeOption = document.createElement("option");
        rangeOption.value = `${startYear}-${endYear}`;
        rangeOption.textContent = `${startYear}-${endYear}`;
        yearSelect.appendChild(rangeOption);

        yearSelect.value = "2024";
    }

    initSidebarToggle() {
        const toggleSidebar = document.getElementById("toggleSidebar");
        toggleSidebar.addEventListener("click", (event) => {
            this.container.classList.toggle("open");
            event.stopPropagation();
        });

        document.addEventListener("click", (event) => {
            if (!this.container.contains(event.target) && !toggleSidebar.contains(event.target)) {
                this.container.classList.remove("open");
            }
        });
    }

    initYearSelection() {
        document.getElementById("yearSelect").addEventListener("change", (event) => {
            const selectedYear = event.target.value;
            loadData(selectedYear).then((newData) => {
                this.data = newData;
                this.filter(); // Call the filter method when the year changes
            });
        });
    }

    initAudioToggle() {
        const audioToggleContainer = document.createElement("div");
        audioToggleContainer.style.marginTop = "10px";

        const audioToggleLabel = document.createElement("label");
        audioToggleLabel.textContent = "Enable Audio:";
        audioToggleLabel.style.marginRight = "10px";

        const audioToggleCheckbox = document.createElement("input");
        audioToggleCheckbox.type = "checkbox";
        audioToggleCheckbox.checked = this.audioEnabled;

        audioToggleCheckbox.addEventListener("change", (event) => {
            this.audioEnabled = event.target.checked;
            this.filter(); // Trigger the filter to update the map
        });

        audioToggleContainer.appendChild(audioToggleLabel);
        audioToggleContainer.appendChild(audioToggleCheckbox);
        this.container.appendChild(audioToggleContainer);
    }
}

export { Sidebar, generateSliders };