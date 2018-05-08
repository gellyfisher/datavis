//line specific global variables
let line;
let cScale;
let legend;

function setUpLineChart() {
	numPoints=99;

	graph=d3.select("div#graph")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	// graph.on("mousemove", function() {drawIndicator(this)});

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
		.attr("id", "line_x_axis")
		.attr("transform", `translate(0, ${height - padding.bottom})`)
		.call(xAxis)
		.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", "rotate(-30)");  // rotate the axis labels


	graph.append("g")
		.attr("class", "y axis")
		.attr("id", "line_y_axis")
		.attr("transform", `translate(${padding.left}, 0)`)
		.call(yAxis);

	graph.append("text")
	  .attr("transform",`rotate(-90)`)
      .attr("y", 0)
      .attr("x",-height/2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Price in Euro");

	line = d3.line()
			.curve(d3.curveBundle)
    		.x(d => xScale(d.time))
    		.y(d => yScale((d.high+d.low+d.close)/3));

}


function drawLineChart(data) {
	xScale.domain([d3.min(data,d=> d3.min(d.data,D=>D.time)),d3.max(data,d=> d3.max(d.data,D=>D.time))]);
	yScale.domain([0,d3.max(data,d=> d3.max(d.data,D=>D.high))]);

	for (let i=0;i<currencyNames.length;i++) {
		graph.select("path."+currencyNames[i].shortName).remove();
	}

	d3.selectAll(".line_graph_line").remove()
	d3.selectAll(".mouse-per-line").remove()

	for (let i=0;i<data.length;i++) {
		graph.append("g").attr("class", "line_graph_line")
			.append("path").datum(data[i].data)
			.attr("class", "line_class ")
			.attr("id",  data[i].currency)
			.attr("fill", "none")
			.attr("stroke", cScale(i))
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("stroke-width", 1.5)
			.attr("d", line);
	}

	legend = graph.selectAll(".legend").data(data);

	legend.exit().remove();

    legend=legend.enter()
   		.append("g")
    	.attr("class","legend")
		.attr("transform", "translate(" + (width -padding.right+20) + "," + 0+ ")");

	legend.append("rect")
		.attr("x", 0)
		.attr("y", function(d, i) { return 60+20*i; })
		.attr("width", 10)
		.attr("height", 10)
		.style("fill", function(d, i) { return cScale(i); });

	legend.append("text")
		.attr("x", 20)
		.attr("dy", "0.75em")
		.attr("y", function(d, i) { return 60+20*i; })
		.text(function(d) {return findLongName(d.currency)});

	legend.append("text")
		 .attr("x",0)
		 .attr("y",50)
		 .text("Categories");

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


	var mouseG = graph.append("g")
		.attr("class", "mouse-over-effects")

	mouseG.append("path")
	.attr("class", "mouse-line")
	.attr("y", padding.top)
	.attr('length', "30px")
	.style("stroke", "black")
	.style("stroke-width", "1px")
	.style("opacity", "0")

	var lines = document.getElementsByClassName('line_class');

  var mousePerLine = mouseG.selectAll('.mouse-per-line')
    .data(data)
    .enter()
    .append("g")
    .attr("class", "mouse-per-line");


  mousePerLine.append("circle")
    .attr("r", 7)
    .style("stroke", function(d) {
			var graphshit = graph.select("#" + d.currency)
			var color = graphshit["_groups"][0][0].getAttribute("stroke")
      return color;
    })
    .style("fill", "none")
    .style("stroke-width", "1px")
    .style("opacity", "0");
		mousePerLine.append("text")
      .attr("transform", "translate(10,3)");

		var y_axis_width = graph.select("#line_y_axis").node().getBBox().width
		var y_axis_x_start = graph.select("#line_y_axis").node().getBBox().x

    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
      .attr('width', width - padding.left - padding.right - y_axis_width) // can't catch mouse events on a g element
      .attr('height', height - padding.bottom - padding.top)
			.attr("x", y_axis_x_start + y_axis_width + padding.left)
			.attr("y", padding.top)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function() { // on mouse out hide line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "0");
      })
      .on('mouseover', function() { // on mouse in show line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "1");
      })
      .on('mousemove', function() { // mouse moving over canvas
        var mouse = d3.mouse(this);
        d3.select(".mouse-line")
          .attr("d", function() {
            var d = "M" + mouse[0] + "," + height;
            d += " " + mouse[0] + "," + 0;
            return d;
          });


        d3.selectAll(".mouse-per-line")
          .attr("transform", function(d, i) {

            var xDate = xScale.invert(mouse[0])
          	var bisect = d3.bisector(function(d) { return d.time; }).right;

            var beginning = 0,
                end = lines[i].getTotalLength(),
                target = null;

            while (true){
              target = Math.floor((beginning + end) / 2);
              pos = lines[i].getPointAtLength(target);
              if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                  break;
              }
              if (pos.x > mouse[0])      end = target;
              else if (pos.x < mouse[0]) beginning = target;
              else break; //position found
            }

            d3.select(this).select('text')
              .text(yScale.invert(pos.y).toFixed(2));

            return "translate(" + mouse[0] + "," + pos.y +")";
          });
      });
}
