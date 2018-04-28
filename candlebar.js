
function drawCandleChart() {
	xScale.domain(d3.extent(data, d => d.time));
	yScale.domain([0,d3.max(data, d => d.high)]);
	
	let high=graph.selectAll("line.high").data(data,d=>d.time);
	
	high.exit().remove();
		  
	high.enter()
		.append("line")
		.attr("class","high")
		.attr("x1",d => xScale(d.time)-5)
		.attr("x2",d => xScale(d.time)+5)
		.attr("y1",d => yScale(0))
		.attr("y2",d => yScale(0))
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
		.attr("y1",d => yScale(0))
		.attr("y2",d => yScale(0))
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
		.attr("y1",d => yScale(0))
		.attr("y2",d => yScale(0))
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
		.attr("y",d => yScale(0))
		.attr("x",d => xScale(d.time)-4)
		.attr("height",0)
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