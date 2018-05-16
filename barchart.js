let ybarScale,xbarScale,cbarScale;
let bar_graph;

let bar_yAxis;

let bar_graph_padding={top: 30, right: padding.right, bottom: 10, left: padding.left};

let bar_graph_height=140-bar_graph_padding.top-bar_graph_padding.bottom; // height of bars
let bar_graph_width=width-bar_graph_padding.left-bar_graph_padding.right;

function setUpBarChart() {
	bar_graph=d3.select("div#volumes")
		.append("svg")
		.attr("width", width)
		.attr("height", 140)
		.append("g")
		.attr("transform","translate(" + bar_graph_padding.left + "," + bar_graph_padding.top + ")");

	xbarScale = d3.scaleBand()
			.rangeRound([0, bar_graph_width])
			.paddingInner(0.05);

	ybarScale = d3.scaleLinear()
				.range([bar_graph_height,0])
				.domain([0,10]);

	bar_yAxis = d3.axisLeft()
				.scale(ybarScale)
				.ticks(5);

	bar_yAxis.tickFormat(function(d) {
		if (d<1000){
			return d;
		} else if (d<1000000) {
			return Math.round(d/1000) + " K";
		} else if (d<1000000000) {
			return Math.round(d/1000000) + " M";
		} else {
			return Math.round(d/1000000000) + " B";
		}
	});

	bar_graph.append("g")
		.attr("class", "y axis bar")
		.call(bar_yAxis);

	bar_graph.append("text")
      .attr("y", -bar_graph_padding.top)
      .attr("x",-bar_graph_padding.left)
      .attr("dy", "1em")
      .style("text-anchor", "left")
      .text("Trading volumes (Euro)");

	coin = null
}


function drawBarChart(data) {

	if (coin === null || data === null) {
			d3.select("#volumes").style("display", "none");
		return;
	}
		d3.select("#volumes").style("display", "block");

	let found = false;
	let bardata,cbarScale;

	for (key in data) {
		if (data[key].currency === coin) {
			bardata = data[key].data
			cbarScale = d3.scaleSequential()
				.interpolator(d3.interpolateRgb(shadeColor(cScale(key), 40), shadeColor(cScale(key), -40)));
			found=true;
		}
	}

	if (!found) {
		throw "specified coin not found";
		return;
	}

	xbarScale.domain(d3.range(bardata.length));
	ybarScale.domain([0,d3.max(bardata,d=>d.volumeto) * y_axis_multiplier]);
	cbarScale.domain([0,d3.max(bardata,d=>d.volumeto)]);

	bar_graph.select(".y.axis.bar")
		.transition()
		.call(bar_yAxis)

	let bars = bar_graph.selectAll("rect")
    	.data(bardata, d => d.time);

	bars.exit().remove();

	bars.enter()
		.append("rect")
		.attr("x", (d, i) => xbarScale(i))
		.attr("y", ybarScale(0))
		.attr("width", xbarScale.bandwidth())
		.attr("height", d => 0)
		.attr("fill", d => cbarScale(d.volumeto))
		.merge(bars)
		.attr("id", (d, i) => "bar"+i) //needs to be before transition (otherwise async execution and indicator won't find the id yet)
		.transition()
		.attr("width", xbarScale.bandwidth())
		.attr("x", (d, i) => xbarScale(i))
		.attr("y", d => ybarScale(d.volumeto))
		.attr("height", d => bar_graph_height-ybarScale(d.volumeto))
		.attr("fill", d => cbarScale(d.volumeto));

	drawBarGraphIndicator()
	drawBarChartGridLines()
}


function drawBarGraphIndicator() {
	if (coin!==null) {
		let eachBand = xbarScale.step(); //distance between 2 bands
		let index = Math.floor((mouseCoordX-bar_graph_padding.left) / eachBand);
		bar_graph.select("#bar"+index).attr("stroke","black");
		bar_graph.selectAll("rect:not(#bar"+index+")").attr("stroke",null);
	}
}

function drawBarChartGridLines() {
	bar_graph.selectAll(".gridline").remove()
	let ticks = bar_graph.selectAll("g.y>g.tick")  //nth-child(n+3) to avoid selecting the tick on the x-axis
	.append("line")
		.attr("class", "gridline")
		.attr("stroke", grid_stroke_color)
		.attr("zIndex", "-1")
		.attr("x2", width - padding.right - padding.left)
}
