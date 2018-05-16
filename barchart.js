let ybarScale,xbarScale,cbarScale;
let bar_graph;

let bar_height=100; // height of bar chart
let bar_graph_height = 120;

let bar_xAxis;
let bar_yAxis;

let upper_bar_graph_padding = 10;
let bottom_bar_graph_padding = 10;


function setUpBarChart() {
	bar_graph=d3.select("div#volumes")
		.append("svg")
		.attr("width", width)
		.attr("height", bar_graph_height);

	xbarScale = d3.scaleBand()
			.rangeRound([padding.left, width - padding.right])
			.paddingInner(0.05);

	ybarScale = d3.scaleLinear()
				.range([bottom_bar_graph_padding, bar_graph_height - upper_bar_graph_padding ])
				.domain([10,0]);

	bar_yAxis = d3.axisLeft()
				.scale(ybarScale)
				.tickPadding(15)

	bar_xAxis = d3.axisBottom()
				.scale(xbarScale)
				.tickFormat(time_format_day);

	bar_graph.append("g")
		.attr("class", "x axis bar")
		.attr("transform", `translate(0, ${height - padding.bottom})`)
		.call(bar_xAxis)
		.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", "rotate(-30)");  // rotate the axis labels

	bar_graph.append("g")
		.attr("class", "y axis bar")
		.attr("transform", `translate(${padding.left}, 0)`)
		.call(bar_yAxis);

	coin = null
}


function drawBarChart(data) {
	saveData=data;

	if (coin === null) {
		return;
	}

	let found = false;
	let bardata;
	let cbarScale;

	bar_yAxis.tickFormat(function(d) {console.log(d); return Math.round(d/1000) + " K"})

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
	ybarScale.domain([0,d3.max(bardata,d=>d.volumeto)]);
	cbarScale.domain([0,d3.max(bardata,d=>d.volumeto)]);


	bar_graph.select(".x.axis.bar")
		.transition()
		.call(bar_xAxis)
		.selectAll("text")	 // rotate the axis labels
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", "rotate(-30)");

	bar_graph.select(".y.axis.bar")
		.transition()
		.call(bar_yAxis)

	let bars = bar_graph.selectAll("rect")
    	.data(bardata, d => d.time);

	bars.exit().remove();

  bars.enter()
    .append("rect")
    .attr("x", (d, i) => xbarScale(i))
    .attr("y", bar_height)
		.attr("width", xbarScale.bandwidth())
    .attr("height", d => ybarScale(0))
  	.attr("fill", d => cbarScale(d.volumeto))
  .merge(bars)
	.transition()
		.attr("id", (d, i) => "bar"+i)
		.attr("width", xbarScale.bandwidth())
    .attr("x", (d, i) => xbarScale(i))
  	.attr("y", d => bar_height - ybarScale(d.volumeto))
  	.attr("height", d => ybarScale(d.volumeto))
  	.attr("fill", d => cbarScale(d.volumeto));

}


function drawBarGraphIndicator() {
	if (coin!==null) {
		let eachBand = xbarScale.step(); //distance between 2 bands
		let index = Math.floor((mouseCoordX-padding.left) / eachBand);
		bar_graph.select("#bar"+index).attr("stroke","black");
		bar_graph.selectAll("rect:not(#bar"+index+")").attr("stroke",null);
	}
}
