//specific global variables for the candle bar chart
let graph,xScale,yScale;
let xAxis,yAxis;
let timeFormat = d3.timeFormat("%b %e %Y");
let dragging=false;
let prevMouseX;
let prevTime=Date.now();

function setUpCandleChart() {
	numPoints=30;
	
	graph=d3.select("div#graph")
		.append("svg")
		.attr("width", width)
		.attr("height", height);
	
	d3.select("div#graph").on("wheel", function () {scrollGraph(this)});	
	
	d3.select("div#graph").on("mousedown", function() {startDragGraph(this)});
	d3.select("div#graph").on("mousemove", function() {dragGraph(this)});
	d3.select("div#graph").on("mouseup", function() {endDragGraph(this)});
	
	xScale = d3.scaleTime()                      
				.range([padding.left, width - padding.right])
				.domain([start,end]);
	  
	yScale = d3.scaleLinear()
				.range([height - padding.bottom, padding.top])
				.domain([0,7500]); //just giving an approximate default so that it doesnt transition from [0,1]
						
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
}

function drawCandleChart(data) {
	xScale.domain(d3.extent(data, d => d.time));
	yScale.domain([0,d3.max(data, d => d.high)]);
	
	let high=graph.selectAll("line.high").data(data,d=>d.time);
	
	high.exit().remove();
		  
	high.enter()
		.append("line")
		.attr("class","high")
		.attr("x1",d => xScale(d.time)-5)
		.attr("x2",d => xScale(d.time)+5)
		.attr("y1",d => yScale(d.high))
		.attr("y2",d => yScale(d.high))
		.merge(high)
		.transition()
		.duration(200)
		.attr("x1",d => xScale(d.time)-5)
		.attr("x2",d => xScale(d.time)+5)
		.attr("y1",d => yScale(d.high))
		.attr("y2",d => yScale(d.high))
		.attr("stroke", "#ccc");
		  
	let low=graph.selectAll("line.low").data(data,d=>d.time);
	
	low.exit().remove();
		  
	low.enter()
		.append("line")
		.attr("class","low")
		.attr("x1",d => xScale(d.time)-5)
		.attr("x2",d => xScale(d.time)+5)
		.attr("y1",d => yScale(d.low))
		.attr("y2",d => yScale(d.low))
		.merge(low)
		.transition()
		.duration(200)
		.attr("x1",d => xScale(d.time)-5)
		.attr("x2",d => xScale(d.time)+5)
		.attr("y1",d => yScale(d.low))
		.attr("y2",d => yScale(d.low))
		.attr("stroke", "#ccc");
		
	let vertical=graph.selectAll("line.vertical").data(data,d=>d.time);
	
	vertical.exit().remove();
		  
	vertical.enter()
		.append("line")
		.attr("class","vertical")
		.attr("x1",d => xScale(d.time))
		.attr("x2",d => xScale(d.time))
		.attr("y1",d => yScale(d.low))
		.attr("y2",d => yScale(d.high))
		.merge(vertical)
		.transition()
		.duration(200)
		.attr("x1",d => xScale(d.time))
		.attr("x2",d => xScale(d.time))
		.attr("y1",d => yScale(d.low))
		.attr("y2",d => yScale(d.high))
		.attr("stroke", "#ccc");
		
	let rectangles=graph.selectAll("rect").data(data,d=>d.time);
	
	rectangles.exit().remove();
	
	rectangles.enter()
		.append("rect")
		.attr("width",8)
		.attr("y",d => Math.min(yScale(d.open),yScale(d.close)))
		.attr("x",d => xScale(d.time)-4)
		.attr("height",d => Math.abs(yScale(d.close)-yScale(d.open)))
		.attr("stroke-width",1)
		.merge(rectangles)
		.transition()
		.duration(200)
		.attr("x",d => xScale(d.time)-4)
		.attr("fill",d => (d.open<=d.close)?"green":"red")
		.attr("stroke",d => (d.open<=d.close)?"#2F4F4F":"#AA98A9")
		.attr("y",d => Math.min(yScale(d.open),yScale(d.close)))
		.attr("height",d => Math.abs(yScale(d.close)-yScale(d.open)))
		
		  
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