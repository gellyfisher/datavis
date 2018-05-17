
let slider_xScale;
let slider_yScale;
let slider_xAxis;
let slider_yAxis;
let slider_graph;
let slider_grap_line;

function setUpSlider() {

  let height = 50;
	slider_graph = d3.select("div#date_range_slider")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	/* we can use the same functions to handle the events */

	slider_xScale = d3.scaleTime()
				.range([padding.left, width - padding.right])
				.domain([minimumDate, new Date()]);

	slider_yScale = d3.scaleLinear()
				.range([height - padding.bottom, padding.top])
				.domain([0,10]);

	slider_xAxis = d3.axisBottom()
				.scale(slider_xScale)
				.tickFormat(time_format_day);

	slider_graph.append("g")
		.attr("class", "x axis line")
		.attr("transform", `translate(0, ${height - padding.bottom})`)
		.call(line_xAxis)
		.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", "rotate(-30)");  // rotate the axis labels


	slider_graph.append("text")
	  .attr("transform",`rotate(-90)`)
      .attr("y", 0)
      .attr("x",-height/2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Value");

	setUpSliderLine();
}

function setUpSliderLine() {
	let line_grap_line = d3.line()
			.curve(d3.curveLinear)
			.x(d => line_xScale(d.time))
			.defined(function (d) {return (d.high!==0)})

	line_grap_line.y(d => line_yScale((d.high+d.low+d.close)/3));

}


function drawSlider(data) {

	line_xScale.domain([d3.min(data,d=> d3.min(d.data,D=>D.time)),d3.max(data,d=> d3.max(d.data,D=>D.time))]);

	line_yScale.domain([0,d3.max(data,d=> d3.max(d.data,D=>D.high))]);


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
		.call(line_yAxis);

	drawLineIndicator();
}

/*function drawLineLegend(data) {
	legendRects = line_graph_legend.selectAll("rect.legend").data(data,d => d.currency);
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
			.style("fill", function(d, i) { return getColorByCurrencyName(data[i].currency); });

	legendTexts=line_graph_legend.selectAll("text.legend").data(data,d => d.currency);
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
				if (document.getElementsByClassName('line_graph_line_class')[i].getPointAtLength(0).x<=mouseCoordX) {
					return ""
				} else {
					return "none"
				};
			})

		mouseTexts=line_graph.selectAll("text.mouseText").data(data,d=>d.currency);
		mouseTexts.exit().remove();
		mouseTexts.enter()
			.append("text")
			.attr("class","mouseText")
			.attr("font-size", "small")
			.merge(mouseTexts)
			.attr("x",mouseCoordX)
			.attr("y",function (d,i) {
				return getY(i, "line_graph_line_class");
			})
			.attr("transform", "translate(10,3)")
			.text(function (d,i) {return line_yScale.invert(getY(i, "line_graph_line_class")).toFixed(3)});
	}
}*/