//specific global variables for the candle bar chart
let candlebar_graph;
let candlebar_xScale;
let candlebar_yScale;
let candlebar_xAxis;
let candlebar_yAxis;

function setUpCandleChart() {

	candlebar_graph=d3.select("div#candle_graph")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	d3.select("div#candle_graph").on("wheel", function () {scrollGraph(this)});

	d3.select("div#candle_graph").on("mousedown", function() {startDragGraph(this)});
	d3.select("div#candle_graph").on("mousemove", function() {dragGraph(this)});
	d3.select("div#candle_graph").on("mouseup", function() {endDragGraph(this)});

	candlebar_xScale = d3.scaleTime()
				.range([padding.left, width - padding.right])
				.domain([start,end]);

	candlebar_yScale = d3.scaleLinear()
				.range([height - padding.bottom, padding.top])
				.domain([0,7500]); //just giving an approximate default so that it doesnt transition from [0,1]

	candlebar_xAxis = d3.axisBottom()
				.scale(candlebar_xScale)
				.tickFormat(timeFormat);

	candlebar_yAxis = d3.axisLeft()
				.scale(candlebar_yScale)

	candlebar_graph.append("g")
		.attr("class", "x axis")
		.attr("transform", `translate(0, ${height - padding.bottom})`)
		.call(candlebar_xAxis)
		.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", "rotate(-30)");  // rotate the axis labels


	candlebar_graph.append("g")
		.attr("class", "y axis")
		.attr("transform", `translate(${padding.left}, 0)`)
		.call(candlebar_yAxis);
}

function drawCandleChart(data) {

	if (coin === null) {
		return;
	}

	console.log(data)

	let found = false;
	let candlebardata;
	for (key in data) {
		if (data[key].currency === coin) {
			candlebardata = data[key].data
			found=true;
		}
	}

	console.log(candlebardata)

	if (!found) {
		throw "specified coin not found";
		return;
	}


	candlebar_xScale.domain(d3.extent(candlebardata, d => d.time));
	candlebar_yScale.domain([0,d3.max(candlebardata, d => d.high)]);

	let high=candlebar_graph.selectAll("line.high").data(candlebardata,d=>d.time);

	high.exit().remove();

	high.enter()
		.append("line")
		.attr("class","high")
		.attr("x1",d => candlebar_xScale(d.time)-5)
		.attr("x2",d => candlebar_xScale(d.time)+5)
		.attr("y1",d => candlebar_yScale(d.high))
		.attr("y2",d => candlebar_yScale(d.high))
		.merge(high)
		.transition()
		.duration(200)
		.attr("x1",d => candlebar_xScale(d.time)-5)
		.attr("x2",d => candlebar_xScale(d.time)+5)
		.attr("y1",d => candlebar_yScale(d.high))
		.attr("y2",d => candlebar_yScale(d.high))
		.attr("stroke", "#ccc");

	let low=candlebar_graph.selectAll("line.low").data(candlebardata,d=>d.time);

	low.exit().remove();

	low.enter()
		.append("line")
		.attr("class","low")
		.attr("x1",d => candlebar_xScale(d.time)-5)
		.attr("x2",d => candlebar_xScale(d.time)+5)
		.attr("y1",d => candlebar_yScale(d.low))
		.attr("y2",d => candlebar_yScale(d.low))
		.merge(low)
		.transition()
		.duration(200)
		.attr("x1",d => candlebar_xScale(d.time)-5)
		.attr("x2",d => candlebar_xScale(d.time)+5)
		.attr("y1",d => candlebar_yScale(d.low))
		.attr("y2",d => candlebar_yScale(d.low))
		.attr("stroke", "#ccc");

	let vertical=candlebar_graph.selectAll("line.vertical").data(candlebardata,d=>d.time);

	vertical.exit().remove();

	vertical.enter()
		.append("line")
		.attr("class","vertical")
		.attr("x1",d => candlebar_xScale(d.time))
		.attr("x2",d => candlebar_xScale(d.time))
		.attr("y1",d => candlebar_yScale(d.low))
		.attr("y2",d => candlebar_yScale(d.high))
		.merge(vertical)
		.transition()
		.duration(200)
		.attr("x1",d => candlebar_xScale(d.time))
		.attr("x2",d => candlebar_xScale(d.time))
		.attr("y1",d => candlebar_yScale(d.low))
		.attr("y2",d => candlebar_yScale(d.high))
		.attr("stroke", "#ccc");

	let rectangles=candlebar_graph.selectAll("rect").data(candlebardata,d=>d.time);

	rectangles.exit().remove();

	rectangles.enter()
		.append("rect")
		.attr("width",8)
		.attr("y",d => Math.min(candlebar_yScale(d.open),candlebar_yScale(d.close)))
		.attr("x",d => candlebar_xScale(d.time)-4)
		.attr("height",d => Math.abs(candlebar_yScale(d.close)-candlebar_yScale(d.open)))
		.attr("stroke-width",1)
		.merge(rectangles)
		.transition()
		.duration(200)
		.attr("x",d => candlebar_xScale(d.time)-4)
		.attr("fill",d => (d.open<=d.close)?"green":"red")
		.attr("stroke",d => (d.open<=d.close)?"#2F4F4F":"#AA98A9")
		.attr("y",d => Math.min(candlebar_yScale(d.open),candlebar_yScale(d.close)))
		.attr("height",d => Math.abs(candlebar_yScale(d.close)-candlebar_yScale(d.open)))


	candlebar_graph.select(".x.axis")
		.transition()
		.call(candlebar_xAxis)
		.selectAll("text")	 // rotate the axis labels
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", "rotate(-30)");

  candlebar_graph.select(".y.axis")
		.transition()
		.call(candlebar_yAxis);
}
