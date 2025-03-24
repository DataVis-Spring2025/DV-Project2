class SliderRange {
    constructor({ containerId, label, min, max, step, values, onSlide }) {
        this.containerId = containerId;
        this.label = label;
        this.min = min;
        this.max = max;
        this.step = step;
        this.values = Array.isArray(values)
            ? values.map(value => (isNaN(parseFloat(value)) ? 0 : parseFloat(value)))
            : [0, 0];
        this.onSlide = onSlide;

        this.initSlider();
    }

    initSlider() {
        // Create label and input for the slider
        const container = document.getElementById(this.containerId);
        const labelElement = document.createElement("label");
        labelElement.textContent = this.label;
        labelElement.setAttribute("for", `${this.containerId}-input`);

        const inputElement = document.createElement("input");
        inputElement.type = "text";
        inputElement.id = `${this.containerId}-input`;
        inputElement.readOnly = true;
        inputElement.style.cssText = "border:0; color:#f6931f; font-weight:bold;";

        const sliderElement = document.createElement("div");
        sliderElement.id = `${this.containerId}-slider`;
        sliderElement.style.height = "10px";

        container.appendChild(labelElement);
        container.appendChild(inputElement);
        container.appendChild(sliderElement);

        // Initialize jQuery UI slider
        $(`#${sliderElement.id}`).slider({
            min: this.min,
            max: this.max,
            orientation: "horizontal",
            range: true,
            step: this.step,
            values: this.values,
            create: () => {
                $(`#${inputElement.id}`).val(`${this.values[0]} - ${this.values[1]}`);
            },
            slide: (event, ui) => {
                $(`#${inputElement.id}`).val(`${ui.values[0]} - ${ui.values[1]}`);
                this.onSlide(ui.values, this.containerId);
            },
        });
    }

    getElement() {
        return document.getElementById(this.containerId);
    }
}

export { SliderRange };