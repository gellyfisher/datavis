//line specific global variables


let compare_graph_legend;
let compare_xScale;
let compare_yScale;
let compare_xAxis;
let compare_yAxis;
let compare_graph;
let compare_graph_line;

function setUpComparisonChart() {


	compare_graph = d3.select("div#compare_graph")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	/* we can use the same functions to handle the events */
	compare_graph.on("wheel", function() {scrollGraph(this);});

	compare_graph.on("mousedown", function() {startDragGraph(this)});
	compare_graph.on("mouseup", function() {endDragGraph(this)});

	compare_xScale = d3.scaleTime()
				.range([padding.left, width - padding.right])
				.domain([start,end]);

	compare_yScale = d3.scaleLinear()
				.range([height - padding.bottom, padding.top])
				.domain([0,10]);

	compare_xAxis = d3.axisBottom()
				.scale(compare_xScale)
				.tickFormat(time_format_day);

	compare_yAxis = d3.axisLeft()
				.scale(compare_yScale)
				
	compare_yAxis.tickFormat(function(d) {
			return Math.round(d * 100).toString() + " %";
		})

	compare_graph.append("g")
		.attr("class", "x axis compare")
		.attr("transform", `translate(0, ${height - padding.bottom})`)
		.call(compare_xAxis)
		.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", "rotate(-30)");  // rotate the axis labels

	compare_graph.append("g")
		.attr("class", "y axis compare")
		.attr("transform", `translate(${padding.left}, 0)`)
		.call(compare_yAxis);

	compare_graph.append("text")
	  .attr("transform",`rotate(-90)`)
      .attr("y", 0)
      .attr("x",-height/2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Increment since start");

	compare_graph_legend = compare_graph.append("g")
			.attr("class","legend")
			.attr("transform", "translate(" + (width -padding.right+40) + "," + 0+ ")")

	compare_graph_legend.append("text")
		.attr("x",0)
		.attr("y",50)
		.attr("font-weight","bold")
		.text("Currencies");

	setUpCompare();
}

function setUpCompare() {
	compare_graph_line = d3.line()
			.curve(d3.curveLinear)
			.x(d => compare_xScale(d.time))
			.defined(function (d) {return (d.high!==0)})

	compare_graph_line.y(function (d,i,data) {
		if (data[0].high+data[0].low+data[0].close!==0) {
			return compare_yScale((d.high+d.low+d.close)/(data[0].high+data[0].low+data[0].close));
		} else {
			return compare_yScale((d.high+d.low+d.close)/0.005); //we default the beginning price of a new currency to 0.005
		}
	});

}


function drawComparisonChart(data) {

	setAxisTimeFormat(compare_xAxis, data);

	saveData=data;
	compare_xScale.domain([d3.min(data,d=> d3.min(d.data,D=>D.time)),d3.max(data,d=> d3.max(d.data,D=>D.time))]);

	compare_yScale.domain([0,
		d3.max(data,d=>
			d3.max(d.data,function (D) {
				if (d.data[0].high+d.data[0].low+d.data[0].close!==0) {
					return (D.high+D.low+D.close)/(d.data[0].high+d.data[0].low+d.data[0].close);
				} else {
					return (D.high+D.low+D.close)/0.005;  //we default the beginning price of a new currency to 0.005
				}
		}) * 1.2)
	]);


	for (let i=0;i<currencyNames.length;i++) {
		compare_graph.select("."+currencyNames[i].shortName).remove();
	}

	for (let i=0;i<data.length;i++) {
		compare_graph.append("g").attr("class",  data[i].currency)
			.append("path").datum(data[i].data)
			.attr("class", "compare_graph_line_class line_class")
			.attr("fill", "none")
			.attr("stroke", cScale(i))
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("stroke-width", data[i].currency===coin?2.5:1.5)
			.attr("d", compare_graph_line);
	}

	drawComparisonLegend(data);

	compare_graph.select(".x.axis.compare")
		.transition()
		.call(compare_xAxis)
		.selectAll("text")	 // rotate the axis labels
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", "rotate(-30)");

	compare_graph.select(".y.axis.compare")
		.transition()
		.call(compare_yAxis);

	drawComparisonIndicator();
	drawComparisonChartGridLines();
}

function drawComparisonLegend(data) {
	legendRects = compare_graph_legend.selectAll("rect.legend").data(data,d => d.currency);
	legendRects.exit()
				.transition()
				.attr("x", padding.right)
				.remove();

	legendRects.enter()
			.append("rect")
			.attr("class","legend")
			.attr("x", padding.right)
			.attr("y", function(d, i) { return 60+20*i; })
			.merge(legendRects)
			.transition()
			.attr("x", 0)
			.attr("y", function(d, i) { return 60+20*i; })
			.attr("width", 10)
			.attr("height", 10)
			.style("fill", function(d, i) { return cScale(i); });

	legendTexts=compare_graph_legend.selectAll("text.legend").data(data,d => d.currency);
	legendTexts.exit()
				.transition()
				.attr("x", padding.right+20)
				.remove();

	legendTexts.enter()
		.append("text")
		.attr("class","legend")
		.attr("x", padding.right+20)
		.attr("dy", "0.75em")
		.attr("y", function(d, i) { return 60+20*i; })
		.merge(legendTexts)
		.transition()
		.attr("x", 20)
		.attr("dy", "0.75em")
		.attr("y", function(d, i) { return 60+20*i; })
		.text(function(d) {return findLongName(d.currency)});
}

function drawComparisonIndicator() {
	if (saveData===undefined) {
		return;
	}
	let data=saveData;

	compare_graph.select(".mouse_line").remove();
	compare_graph.selectAll("circle.mouseCircle").remove();
	compare_graph.selectAll("text.mouseText").remove();

	if (mouseCoordX>=padding.left && mouseCoordX<=width-padding.right) {
		compare_graph.append("line")
			.attr("class","mouse_line")
			.attr("x1",mouseCoordX)
			.attr("x2",mouseCoordX)
			.attr("y1",padding.top)
			.attr("y2",height-padding.bottom)
			.style("stroke", "black")
			.style("stroke-width", "1px")

		let mouseCircles=compare_graph.selectAll("circle.mouseCircle").data(data,d=>d.currency)
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
				return getY(i, "compare_graph_line_class");
			})
			.style("stroke", function(d, i) { return cScale(i); })
			.style("display",function (d,i) {
				let lineX=document.getElementsByClassName('line_graph_line_class')[i].getPointAtLength(0).x;
				if (lineX<=mouseCoordX && lineX!==0) {
					return ""
				} else {
					return "none"
				};
			});

		mouseTexts=compare_graph.selectAll("text.mouseText").data(data,d=>d.currency);
		mouseTexts.exit().remove();
		mouseTexts.enter()
			.append("text")
			.attr("class","mouseText")
			.attr("font-size", "small")
			.merge(mouseTexts)
			.attr("x",mouseCoordX)
			.attr("y",function (d,i) {
				return getY(i, "compare_graph_line_class");
			})
			.attr("transform", "translate(10,3)")
			.text(function (d,i) {return compare_yScale.invert(getY(i, "compare_graph_line_class")).toFixed(3)})
			.style("display",function (d,i) {
				let lineX=document.getElementsByClassName('line_graph_line_class')[i].getPointAtLength(0).x;
				if (lineX<=mouseCoordX && lineX!==0) {
					return ""
				} else {
					return "none"
				};
			});
	}
}


function drawComparisonChartGridLines() {
	compare_graph.selectAll(".gridline").remove()
	let ticks = compare_graph.selectAll("g.y>g.tick:nth-child(n + 3)")  //nth-child(n+3) to avoid selecting the tick on the x-axis
	.append("line")
		.attr("class", "gridline")
		.attr("stroke", grid_stroke_color)
		.attr("zIndex", "-1")
		.attr("x2", width - padding.right - padding.left)
}
