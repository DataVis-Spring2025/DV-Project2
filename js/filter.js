export class Filter {
	constructor(data, visualizations) {
		this.data = data;
		this.visualizations = visualizations;
        this.count = 0;
	}

	apply(minDate, maxDate, magMax, magMin, depMax, depMin) {
		console.log("filter begin - " + this.count);
		/*const filteredData = this.data.filter((d) => {
            // add slider range filters here

            // timeline filter
            if(d.parsedTime < minDate) return false;
            if(d.parsedTime > maxDate) return false;
            
            return true;
        })*/
        const filteredData = Filter.filterDataByDate(this.data, minDate, maxDate).filter(d => {
			if (d.mag <= magMin || d.mag >= magMax) return false;
			if (d.depth <= depMin || d.depth >= depMax) return false;
			return true;
		});

		this.visualizations.forEach((vis) => {
			vis.data = filteredData;
			vis.updateVis();
		});

		console.log("filter end - " + this.count++);
	}

	static filterDataByDate(data, minDate, maxDate) {
		const sqrtSearch = (arr, target, comparator) => {
			const step = Math.floor(Math.sqrt(arr.length));
			let prev = 0;

			// Jump forward in blocks of size `step`
			while (prev < arr.length && comparator(arr[Math.min(prev + step, arr.length) - 1], target) < 0) {
				prev += step;
			}

			// Perform linear search in the identified block
			for (let i = prev; i < Math.min(prev + step, arr.length); i++) {
				if (comparator(arr[i], target) >= 0) {
					return i;
				}
			}

			return arr.length;
		};

		// Use square root search with integer timestamps
		const startIndex = sqrtSearch(data, minDate, (d, target) => d.parsedTime - target);
		const endIndex = sqrtSearch(data, maxDate, (d, target) => d.parsedTime - target);

		return data.slice(startIndex, endIndex);
	}
}
