//line specific global variables

let line_graph_legend;
let line_xScale;
let line_yScale;
let line_xAxis;
let line_yAxis;
let line_graph;
let line_grap_line;

function setUpLineChart() {


	line_graph = d3.select("div#line_graph")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	/* we can use the same functions to handle the events */
	line_graph.on("wheel", function() {scrollGraph(this);});

	line_graph.on("mousedown", function() {startDragGraph(this)});
	line_graph.on("mouseup", function() {endDragGraph(this)});

	line_xScale = d3.scaleTime()
				.range([padding.left, width - padding.right])
				.domain([start,end]);

	line_yScale = d3.scaleLinear()
				.range([height - padding.bottom, padding.top])
				.domain([0,10]);

	line_xAxis = d3.axisBottom()
				.scale(line_xScale)
				.tickFormat(time_format_day);

	line_yAxis = d3.axisLeft()
				.scale(line_yScale)

	line_yAxis.tickFormat(function(d) {return "€" + d})

	line_graph.append("g")
		.attr("class", "x axis line")
		.attr("transform", `translate(0, ${height - padding.bottom})`)
		.call(line_xAxis)
		.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", "rotate(-30)");  // rotate the axis labels

	line_graph.append("g")
		.attr("class", "y axis line")
		.attr("transform", `translate(${padding.left}, 0)`)
		.call(line_yAxis);

	line_graph.append("text")
			.attr("class", "line_graph_title")
			.attr("y", 0)
			.attr("x", 0)
			.attr("dy", "1em")
			.style("text-anchor", "left")
			.text("Absolute cryptocurrency value");


	line_graph_legend = line_graph.append("g")
			.attr("class","legend")
			.attr("transform", "translate(" + (width -padding.right+40) + "," + 0+ ")")

	line_graph_legend.append("text")
		.attr("x",0)
		.attr("y",50)
		.attr("font-weight","bold")
		.text("Current value")
		// .text("Currencies");

	setUpLine();
}

function setUpLine() {
	line_grap_line = d3.line()
			.curve(d3.curveLinear)
			.x(d => line_xScale(d.time))
			.defined(function (d) {return (d.high!==0)})

	line_grap_line.y(d => line_yScale((d.high+d.low+d.close)/3));

}


function drawLineChart(data) {
	setAxisTimeFormat(line_xAxis, data);

	line_xScale.domain([d3.min(data,d=> d3.min(d.data,D=>D.time)),d3.max(data,d=> d3.max(d.data,D=>D.time))]);

	let y_axis_max = d3.max(data,d=> d3.max(d.data,D=>D.high))
	let y_axis_min = d3.min(data,d=> d3.min(d.data,D=>D.low))
	let padding = (y_axis_max - y_axis_min) * y_axis_padding_multiplier
	let lowerbound = Math.max( (y_axis_min - padding) , 0)

	line_yScale.domain([lowerbound, y_axis_max + padding]);


	for (let i=0;i<currencyNames.length;i++) {
		line_graph.select("."+currencyNames[i].shortName).remove();
	}


	for (let i=0;i<data.length;i++) {
		line_graph.append("g").attr("class",  data[i].currency)
			.append("path").datum(data[i].data)
			.attr("class", "line_graph_line_class line_class")
			.attr("fill", "none")
			.attr("stroke", getColorByCurrencyName(data[i].currency))
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("stroke-width", data[i].currency===coin?2.5:1.5)
			.attr("d", line_grap_line);
	}

	drawLineLegend(data);

	line_graph.select(".x.axis.line")
		.transition()
		.call(line_xAxis)
		.selectAll("text")	 // rotate the axis labels
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", "rotate(-30)");

	line_graph.select(".y.axis.line")
		.transition()
		.call(line_yAxis)

	drawLineIndicator();

	drawLineChartGridLines()
}

function drawLineLegend(data) {

	let color_rect_x = 10;
	let text_rect_x = 30;


	let legendRects = line_graph_legend.selectAll("rect.legend").data(data,d => d.currency);
	legendRects.exit()
				.transition()
				.attr("x", padding.right + color_rect_x)
				.remove();

	legendRects.enter()
			.append("rect")
			.attr("class","legend")
			.attr("x", padding.right + color_rect_x)
			.attr("y", function(d, i) { return 60+20*i; })
			.on("click",  function(d, i) { handleLineClick(data[i], i); d3.event.stopPropagation(); })
			.merge(legendRects)
			.transition()
			.attr("x", color_rect_x)
			.attr("y", function(d, i) { return 60+20*i; })
			.attr("width", 10)
			.attr("height", 10)
			.style("fill", function(d, i) { return getColorByCurrencyName(data[i].currency); });

	let legendTexts=line_graph_legend.selectAll("text.legend").data(data,d => d.currency);
	legendTexts.exit()
				.transition()
				.attr("x", padding.right + text_rect_x)
				.remove();

	legendTexts.enter()
		.append("text")
		.attr("class","legend")
		.on("click",  function(d, i) { handleLineClick(data[i], i); d3.event.stopPropagation(); })
		.attr("id", function(d) {return findLongName(d.currency)})
		.attr("x", padding.right+text_rect_x)
		.attr("dy", "0.75em")
		.attr("y", function(d, i) { return 60+20*i; })
		.merge(legendTexts)
		.transition()
		.attr("font-weight", function (d,i) { return data[i].currency===coin?"bold":"normal";})
		.attr("x", text_rect_x)
		.attr("dy", "0.75em")
		.attr("y", function(d, i) { return 60+20*i; })

		if (mouseCoordX>=padding.left && mouseCoordX<=width-padding.right) {
			legendTexts.text(function (d,i) {return formatPercentages(compare_yScale.invert(getY(i, "compare_graph_line_class")).toFixed(3))})
		} else {
			legendTexts.text(
				function (d,i) {
					return "100 %";
				})
		}
}

function drawLineIndicator() {
	if (saveData===undefined) {
		return;
	}
	let data=saveData;

	line_graph.select(".mouse_line").remove();
	line_graph.selectAll("circle.mouseCircle").remove();
	line_graph.selectAll("text.mouseText").remove();

	if (mouseCoordX>=padding.left && mouseCoordX<=width-padding.right) {
		line_graph.append("line")
			.attr("class","mouse_line")
			.attr("x1",mouseCoordX)
			.attr("x2",mouseCoordX)
			.attr("y1",padding.top)
			.attr("y2",height-padding.bottom)
			.style("stroke", "black")
			.style("stroke-width", "1px")

		let mouseCircles=line_graph.selectAll("circle.mouseCircle").data(data,d=>d.currency)
		mouseCircles.exit().remove();
		mouseCircles.enter()
			.append("circle")
			.attr("class","mouseCircle")
			.attr("r", mouseCircleRadius)
			.attr("opacity", "0.8")
			.style("pointer-events","visible")
			.style("fill", "none")
			.merge(mouseCircles)
			.on("click",  function(d, i) { handleLineClick(d, i); d3.event.stopPropagation(); })
			.attr("cx",mouseCoordX)
			.attr("cy",function (d,i) {
				return getY(i, "line_graph_line_class");
			})
			.style("stroke", function(d, i) { return getColorByCurrencyName(data[i].currency); })
			.style("display",function (d,i) {
				let lineX=document.getElementsByClassName('line_graph_line_class')[i].getPointAtLength(0).x;
				if (lineX<=mouseCoordX && lineX!==0) {
					return ""
				} else {
					return "none"
				};
			});
	}

	let legendTexts=line_graph_legend.selectAll("text.legend").data(data,d => d.currency)
	if (mouseCoordX>=padding.left && mouseCoordX<=width-padding.right) {
		legendTexts.text(
			function (d,i) {
				return "€ " + line_yScale.invert(getY(i, "line_graph_line_class")).toFixed(3)
			})
	} else {
		legendTexts.text(
			function (d,i) {
				return "€ 0";
			})
	}
}

function drawLineChartGridLines() {
	line_graph.selectAll(".gridline").remove()
	let y_axis = line_graph.selectAll("g.y")
	let ticks = y_axis.selectAll("g.tick:nth-child(n + 3)") //nth-child(n+3) to avoid selecting the tick on the x-axis
	.append("line")
		.attr("class", "gridline")
		.attr("stroke", grid_stroke_color)
		.attr("zIndex", "-1")
		.attr("x2", width - padding.right - padding.left)
}
