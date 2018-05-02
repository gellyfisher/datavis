//line specific global variables
let line;

function setUpLineChart() {
	numPoints=99;
	
	graph=d3.select("div#graph")
		.append("svg")
		.attr("width", width)
		.attr("height", height);
	
	/* we can use the same functions to handle the events */
	d3.select("div#graph").on("wheel", scrollCandle);	
	
	d3.select("div#graph").on("mousedown", function() {startDragCandle(this)});
	d3.select("div#graph").on("mousemove", function() {dragCandle(this)});
	d3.select("div#graph").on("mouseup", function() {endDragCandle(this)});

	xScale = d3.scaleTime()                      
				.range([padding.left, width - padding.right])
				.domain([start,end]);
	  
	yScale = d3.scaleLinear()
				.range([height - padding.bottom, padding.top])
				.domain([0,7500]);
						
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
		
	line = d3.line()
			.curve(d3.curveBundle)
    		.x(d => xScale(d.time))
    		.y(d => yScale((d.high+d.low+d.close)/3));
}

function drawLineChart(data) {	
	xScale.domain([d3.min(data,d=> d3.min(d.data,D=>D.time)),d3.max(data,d=> d3.max(d.data,D=>D.time))]);
	yScale.domain([0,d3.max(data,d=> d3.max(d.data,D=>D.high))]);
	
	for (let i=0;i<data.length;i++) {
		graph.select("path."+data[i].currency).remove()
		
		graph.append("path").datum(data[i].data)
			.attr("class",data[i].currency)
			.attr("fill", "none")
			.attr("stroke", "black")
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("stroke-width", 1.5)
			.attr("d", line);
	}
		  
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
}