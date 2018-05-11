function setUpCompareChart() {
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
      .text("Increment since start of period");  
	  
	legend=graph.append("g")
			.attr("class","legend")
			.attr("transform", "translate(" + (width -padding.right+20) + "," + 0+ ")")
	legend.append("text")
		.attr("x",0)
		.attr("y",50)
		.text("Categories");
		
	line = d3.line()
			.curve(d3.curveBundle)
    		.x(d => xScale(d.time))
    		.y(function (d,i,data) {
				return yScale((d.high+d.low+d.close)/(data[0].high+data[0].low+data[0].close));
			});

    graph.on('mousemove', function() {getMouseCoordinates(this);drawIndicator();});
}

function drawCompareChart(data) {
	saveData=data;
	xScale.domain([d3.min(data,d=> d3.min(d.data,D=>D.time)),d3.max(data,d=> d3.max(d.data,D=>D.time))]);
	yScale.domain([0,d3.max(data,d=> d3.max(d.data,D=>(D.high+D.low+D.close)/(d.data[0].high+d.data[0].low+d.data[0].close)))]);
	
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
			.attr("stroke-width", 1.5)
			.attr("d", line);
	}
		  
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

	//padding.right=legend.node().getBBox().width+20; // get width of our legend*/
	//console.log(padding.right);
	
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