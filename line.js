//line specific global variables
let line;
let cScale;
let legend;
let mouseCoordX=0;
let mouseCoordY=0;

let mouseCircleRadius = 6;

let saveData;

function setUpLineChart() {
	numPoints=40;

	graph=d3.select("div#graph")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	/* we can use the same functions to handle the events */
	graph.on("wheel", scrollGraph);

	graph.on("mousedown", function() {startDragGraph(this)});
	graph.on("mousemove", function() {
			dragGraph(this);
			getMouseCoordinates(this);
			drawIndicator();
		});
	graph.on("mouseup", function() {endDragGraph(this)});

	xScale = d3.scaleTime()
				.range([padding.left, width - padding.right])
				.domain([start,end]);

	yScale = d3.scaleLinear()
				.range([height - padding.bottom, padding.top])
				.domain([0,10]);

	cScale = d3.scaleOrdinal().range(d3.schemeCategory10);

	xAxis = d3.axisBottom()
				.scale(xScale)
				.tickFormat(timeFormat);

	yAxis = d3.axisLeft()
				.scale(yScale)

	graph.append("g")
		.attr("class", "x axis")
		.attr("transform", `translate(0, ${height - padding.bottom})`)
		.call(xAxis)
		.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", "rotate(-30)");  // rotate the axis labels

	graph.append("g")
		.attr("class", "y axis")
		.attr("transform", `translate(${padding.left}, 0)`)
		.call(yAxis);

	graph.append("text")
	  .attr("transform",`rotate(-90)`)
      .attr("y", 0)
      .attr("x",-height/2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Price in Euro");

	legend=graph.append("g")
			.attr("class","legend")
			.attr("transform", "translate(" + (width -padding.right+40) + "," + 0+ ")")

	legend.append("text")
		.attr("x",0)
		.attr("y",50)
		.attr("font-weight","bold")
		.text("Currencies");

	setUpLine();
}

function setUpLine() {
	line = d3.line()
			.curve(d3.curveLinear)
			.x(d => xScale(d.time))
			.defined(function (d) {return (d.high!==0)})

	if (graphType==="compare") {
			line.y(function (d,i,data) {
				if (data[0].high+data[0].low+data[0].close!==0) {
					return yScale((d.high+d.low+d.close)/(data[0].high+data[0].low+data[0].close));
				} else {
					return yScale((d.high+d.low+d.close)/0.005); //we default the beginning price of a new currency to 0.005
				}
			});

	} else if (graphType==="line") {
		line.y(d => yScale((d.high+d.low+d.close)/3));
	}
}

function getMouseCoordinates(container) {
	mouseCoordX=d3.mouse(container)[0];
	mouseCoordY=d3.mouse(container)[1];
}

function drawLineChart(data) {
	saveData=data;
	xScale.domain([d3.min(data,d=> d3.min(d.data,D=>D.time)),d3.max(data,d=> d3.max(d.data,D=>D.time))]);

	if (graphType==="compare") {
		yScale.domain([0,d3.max(data,d=> 
						d3.max(d.data,function (D) {
							if (d.data[0].high+d.data[0].low+d.data[0].close!==0) {
								return (D.high+D.low+D.close)/(d.data[0].high+d.data[0].low+d.data[0].close);
							} else {
								return (D.high+D.low+D.close)/0.005;  //we default the beginning price of a new currency to 0.005
							}
						}))
					]);
	} else {
		yScale.domain([0,d3.max(data,d=> d3.max(d.data,D=>D.high))]);
	}

	for (let i=0;i<currencyNames.length;i++) {
		graph.select("#"+currencyNames[i].shortName).remove();
	}

	for (let i=0;i<data.length;i++) {
		graph.append("g").attr("id",  data[i].currency)
			.append("path").datum(data[i].data)
			.attr("class", "line_class")
			.attr("fill", "none")
			.attr("stroke", cScale(i))
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("stroke-width", data[i].currency===coin?2.5:1.5)
			.attr("d", line);
	}

	drawLegend(data);

	graph.select(".x.axis")
		.transition()
		.call(xAxis)
		.selectAll("text")	 // rotate the axis labels
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", "rotate(-30)");

	graph.select(".y.axis")
		.transition()
		.call(yAxis);

	drawIndicator();
}

function drawLegend(data) {
	legendRects = legend.selectAll("rect.legend").data(data,d => d.currency);
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

	legendTexts=legend.selectAll("text.legend").data(data,d => d.currency);
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

function drawIndicator() {
	if (saveData===undefined) {
		return;
	}
	let data=saveData;

	graph.select(".mouse_line").remove();
	graph.selectAll("circle.mouseCircle").remove();
	graph.selectAll("text.mouseText").remove();

	if (mouseCoordX>=padding.left && mouseCoordX<=width-padding.right) {
		graph.append("line")
			.attr("class","mouse_line")
			.attr("x1",mouseCoordX)
			.attr("x2",mouseCoordX)
			.attr("y1",padding.top)
			.attr("y2",height-padding.bottom)
			.style("stroke", "black")
			.style("stroke-width", "1px")

		mouseCircles=graph.selectAll("circle.mouseCircle").data(data,d=>d.currency);
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
				return getY(i);
			})
			.style("stroke", function(d, i) { return cScale(i); })
			
		mouseTexts=graph.selectAll("text.mouseText").data(data,d=>d.currency);
		mouseTexts.exit().remove();
		mouseTexts.enter()
			.append("text")
			.attr("class","mouseText")
			.attr("font-size", "small")
			.merge(mouseTexts)
			.attr("x",mouseCoordX)
			.attr("y",function (d,i) {
				return getY(i);
			})
			.attr("transform", "translate(10,3)")
			.text(function (d,i) {return yScale.invert(getY(i)).toFixed(3)});
	}
}

function handleLineClick(d, i) {
	d3.select("#"+d.currency+">path").attr("stroke-width",2)
	d3.selectAll("g:not(#"+d.currency+")>path.line_class") //if we don't use path.line_class then the axis will be selected too
			.attr("stroke-width",1.5)

	assignBarChart(d.currency, cScale(i))
}
