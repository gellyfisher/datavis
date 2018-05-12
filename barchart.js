let ybarScale,xbarScale,cbarScale;
let bargraph;

let barheight=100;

function setUpBarChart() {
	bargraph=d3.select("div#volumes")
		.append("svg")
		.attr("width", width)
		.attr("height", barheight);

	xbarScale = d3.scaleBand()
			.rangeRound([padding.left, width - padding.right])
			.paddingInner(0.05);  
	  
	ybarScale = d3.scaleLinear()
				.range([padding.bottom, barheight-padding.top])
				.domain([0,10]);
				
	cbarScale = d3.scaleSequential()             
				.interpolator(d3.interpolateGreens);
}

function drawBarChart(data) {
	saveData=data;
	
	xbarScale.domain(d3.range(data[0].data.length));
	ybarScale.domain([0,d3.max(data[0].data,d=>d.volumeto)]);
	cbarScale.domain([0,d3.max(data[0].data,d=>d.volumeto)]);
	
	let bars = bargraph.selectAll("rect")
    	.data(data[0].data, d => d.time);
    
	bars.exit().remove();
	
    bars.enter()
        .append("rect")
        .attr("x", (d, i) => xbarScale(i))
        .attr("y", d => ybarScale(0))
    	.attr("width", xbarScale.bandwidth()) 
        .attr("height", d => ybarScale(0))
    	.attr("fill", d => cbarScale(d.volumeto))
      .merge(bars)
    	.transition()
        .attr("x", (d, i) => xbarScale(i)) 
    	.attr("y", d => barheight - ybarScale(d.volumeto))
    	.attr("height", d => ybarScale(d.volumeto))
    	.attr("fill", d => cbarScale(d.volumeto));
}