//line specific global variables
let line;
let cScale;
let legend;
let mouseCoordX=0;
let mouseCoordY=0;

let saveData;

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
				
	cScale = d3.scaleOrdinal().range(d3.schemeCategory10);
						
	xAxis = d3.axisBottom() 
				.scale(xScale)
				.tickFormat(timeFormat);
						
	yAxis = d3.axisLeft()
				.scale(yScale)
					
	graph.append("g") 
		.attr("class", "x axis")
		.attr("id","line_x_axis")
		.attr("transform", `translate(0, ${height - padding.bottom})`)
		.call(xAxis)
		.selectAll("text")	   
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", "rotate(-30)");  // rotate the axis labels
		
	  
	graph.append("g") 
		.attr("class", "y axis")
		.attr("id","line_y_axis")
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
			.attr("transform", "translate(" + (width -padding.right+20) + "," + 0+ ")")
	legend.append("text")
		.attr("x",0)
		.attr("y",50)
		.text("Categories");
		
	line = d3.line()
			.curve(d3.curveBundle)
    		.x(d => xScale(d.time))
    		.y(d => yScale((d.high+d.low+d.close)/3));

    graph.on('mousemove', function() {getMouseCoordinates(this);drawIndicator();});
}

function getMouseCoordinates(container) {
	mouseCoordX=d3.mouse(container)[0];
	mouseCoordY=d3.mouse(container)[1];
}

function drawLineChart(data) {
	saveData=data;
	xScale.domain([d3.min(data,d=> d3.min(d.data,D=>D.time)),d3.max(data,d=> d3.max(d.data,D=>D.time))]);
	yScale.domain([0,d3.max(data,d=> d3.max(d.data,D=>D.high))]);
	
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

	/*padding.right=legend.node().getBBox().width+20; // get width of our legend*/
	
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

function drawIndicator() {
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
			.attr("r", 7)
			.merge(mouseCircles)
			.attr("cx",mouseCoordX)
			.attr("cy",function (d,i) {
				return getY(i);
			})
			.style("stroke", function(d, i) { return cScale(i); })
			.style("fill", "none")
			.style("stroke-width", "1px")
			
		mouseTexts=graph.selectAll("text.mouseText").data(data,d=>d.currency);
		mouseTexts.exit().remove();
		mouseTexts.enter()
			.append("text")
			.attr("class","mouseText")
			.merge(mouseTexts)
			.attr("x",mouseCoordX)
			.attr("y",function (d,i) {
				return getY(i);
			})
			.attr("transform", "translate(10,3)")
			.text(function (d,i) {return yScale.invert(getY(i)).toFixed(2)});
	}
}

function getY(i) { //hulp functie om de y coordinaat op een gegeven x coordinaat te bepalen van de ide kromme
	let lines=document.getElementsByClassName('line_class');
	let beginning = 0,
			end = lines[i].getTotalLength(),
			target;
	let pos;

	while (true){
	  target = Math.floor((beginning + end) / 2);
	  pos = lines[i].getPointAtLength(target);
	  if ((target === end || target === beginning) && pos.x !== mouseCoordX) {
		  break;
	  }
	  if (pos.x >  mouseCoordX)      end = target;
	  else if (pos.x <  mouseCoordX) beginning = target;
	  else break; //position found
	}
	return pos.y;
}
