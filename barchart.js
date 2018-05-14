let ybarScale,xbarScale,cbarScale;
let bargraph;

let barheight=100; // height of bar chart

let coin; // currently selected currency

function setUpBarChart() {
	bargraph=d3.select("div#volumes")
		.append("svg")
		.attr("width", width)
		.attr("height", barheight);

	xbarScale = d3.scaleBand()
			.rangeRound([padding.left, width - padding.right])
			.paddingInner(0.05);

	ybarScale = d3.scaleLinear()
				.range([0, barheight])
				.domain([0,10]);
}

function assignBarChart(newcoin, barcolor) {
	coin = newcoin;

	cbarScale = d3.scaleSequential()
				.interpolator(d3.interpolateRgb(shadeColor(barcolor, 40), shadeColor(barcolor, -40)));
	
	drawBarChart(saveData)
}

function drawBarChart(data) {
	saveData=data;

	if (coin === undefined) {
		return;
	}

	let found = false;
	for (key in data) {
		if (data[key].currency === coin) {
			bardata = data[key].data
			found=true;
		}
	}
	
	if (!found) {
		throw "specified coin not found";
		return;
	}

	xbarScale.domain(d3.range(bardata.length));
	ybarScale.domain([0,d3.max(bardata,d=>d.volumeto)]);
	cbarScale.domain([0,d3.max(bardata,d=>d.volumeto)]);

	let bars = bargraph.selectAll("rect")
    	.data(bardata, d => d.time);

	bars.exit().remove();

    bars.enter()
        .append("rect")
        .attr("x", (d, i) => xbarScale(i))
        .attr("y", barheight)
    	.attr("width", xbarScale.bandwidth())
        .attr("height", d => ybarScale(0))
    	.attr("fill", d => cbarScale(d.volumeto))
      .merge(bars)
    	.transition()
		.attr("id",(d,i)=>"bar"+i)
		.attr("width", xbarScale.bandwidth())
        .attr("x", (d, i) => xbarScale(i))
    	.attr("y", d => barheight - ybarScale(d.volumeto))
    	.attr("height", d => ybarScale(d.volumeto))
    	.attr("fill", d => cbarScale(d.volumeto));
}
