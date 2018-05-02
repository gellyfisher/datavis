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
	
	d3.select("div#graph").on("wheel", scrollCandle);	
	
	d3.select("div#graph").on("mousedown", function() {startDragCandle(this)});
	d3.select("div#graph").on("mousemove", function() {dragCandle(this)});
	d3.select("div#graph").on("mouseup", function() {endDragCandle(this)});
	
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

function startDragCandle(container) {
	dragging=true;
	let mouseX=d3.mouse(container)[0];
	
	prevMouseX=mouseX;
}

function endDragCandle(container) {
	dragging=false;
	let mouseX=d3.mouse(container)[0];
	
	let timeInBetween=(end-start)/(numPoints);
	let effectiveWidth=width-padding.left-padding.right
	
	let scale=numPoints*Math.abs(mouseX-prevMouseX)/effectiveWidth
	
	if (mouseX>prevMouseX) {
		dragRightCandle(scale*timeInBetween);
	} else if (mouseX<prevMouseX) {
		dragLeftCandle(scale*timeInBetween);
	}
}

function dragCandle(container) {
	//We will only allow the dragging at most once in 100 ms. Otherwise this function is executed too often.
	
    if (dragging && (prevTime + 100 - Date.now()) < 0) {
		let mouseX=d3.mouse(container)[0];
	
		let timeInBetween=(end-start)/(numPoints);
		let effectiveWidth=width-padding.left-padding.right;
		
		let scale=Math.floor(numPoints*Math.abs(mouseX-prevMouseX)/effectiveWidth);
		
		if (mouseX>prevMouseX) {
			dragRightCandle(scale*timeInBetween);
		} else if (mouseX<prevMouseX) {
			dragLeftCandle(scale*timeInBetween);
		}
		prevMouseX=mouseX;
		prevTime = Date.now();
    }
}

function dragRightCandle(dist) { //in dit geval gaan we terug in de tijd
	dist=Math.min(dist,start.getTime()-minimumDate);
	
	start=new Date(start.getTime()-dist);
	end=new Date(end.getTime()-dist);
	
	requestData();
}

function dragLeftCandle(dist) { // nu gaan we vooruit in de tijd
	dist=Math.min(dist,(new Date()).getTime()-end.getTime());
	
	start=new Date(start.getTime()+dist);
	end=new Date(end.getTime()+dist);
	
	requestData();
}

function scrollCandle() {
	/*change this such that it zooms into the current mouse position... instead of zooming in the middle*/
	
	if (d3.event.deltaY< 0) { //scroll up
		let dist=(end-start)/4;
	
		start=new Date(start.getTime()+dist);
		end=new Date(end.getTime()-dist);
		
	} else { //scroll down
		let dist=(end-start)/2;
	
		start=new Date(Math.max(start.getTime()-dist,minimumDate));
		end=new Date(Math.min(end.getTime()+dist,(new Date()).getTime()));
	 }
	 
	 requestData();
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