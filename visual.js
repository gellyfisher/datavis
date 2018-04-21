var data;
var NUM_POINTS=50;
var end=new Date();
var start = new Date();
start.setDate(end.getDate()-NUM_POINTS);

function requestData(currency="BTC") {	
	var url="https://min-api.cryptocompare.com/data/histo";
	var amount;
	
	timeInBetween=(end-start)/(60*1000*NUM_POINTS)
	
	if (timeInBetween>=24*60) {
		url+="day";
		amount=Math.round(timeInBetween/1440);
	} else if (timeInBetween>=60) {
		url+="hour";
		amount=Math.round(timeInBetween/60);
	} else if (timeInBetween>0) {
		url+="minute";
		amount=timeInBetween
	} else {
		throw "invalid timeInBetween for the data request";
	}
	
	params={
	    fsym: currency, 
	    tsym: "EUR",
		limit: NUM_POINTS,
	    aggregate: amount, //amount of days/hours/minutes in between data points
		toTs: Math.floor(end.getTime() / 1000) //last unix timestamp included
	}
	
	$.ajax({
	    type: "GET", 
	    url: url,
		data: params,
	    success : handleData 
	});
}

function handleData(recv) {
	data=recv.Data;
	data.forEach(function(d) { d.time = new Date(d.time * 1000); });
	
	updateGraphs()
}

const width = 600;
const height = 300;
const padding = {top: 20, left: 40, right: 40, bottom: 50};

let graph,xScale,yScale,xAxis,yAxis;
let timeFormat = d3.timeFormat("%b %e %Y");
setUp();
requestData();

function setUp() {
	graph=d3.select("body")
		.append("svg")
		.attr("width", width)
		.attr("height", height);
		
	graph.append("text")
		.attr("y", padding.top - 3)
		.text("Action!")
		.style("cursor", "hand")
		.on("click", scrollUp);

	xScale = d3.scaleTime()                      
					.range([padding.left, width - padding.right]);
	  
	yScale = d3.scaleLinear()
					.range([height - padding.bottom, padding.top]);
						
	xAxis = d3.axisBottom() 
					.scale(xScale)
					.tickFormat(timeFormat);
						
	yAxis = d3.axisLeft()
					.scale(yScale);
					
	graph.append("g") 
		.attr("class", "x axis")
		.attr("transform", `translate(0, ${height - padding.bottom})`)
		.call(xAxis)
		.selectAll("text")	    // rotate the axis labels
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", "rotate(-30)");
	  
	graph.append("g") 
		.attr("class", "y axis")
		.attr("transform", `translate(${padding.left}, 0)`)
		.call(yAxis);
}

function scrollUp() {
	NUM_POINTS=Math.max(10,Math.ceil(NUM_POINTS/2));
	var dist=(end-start)/2;
	
	start=new Date(Math.max(start.getTime()-dist,0));
	end=new Date(Math.min(end.getTime()+dist,(new Date()).getTime()));
	
	requestData();
}
	
function updateGraphs() {
	xScale.domain(d3.extent(data, d => d.time));
	yScale.domain([0,d3.max(data, d => d.high)]);
	
	let circles=graph.selectAll("circle").data(data);
	
	circles.exit().remove();
		  
	circles.enter()
		.append("circle")
		.attr("cx", d => xScale(d.time))
		.attr("cy", d => yScale(0))
		.attr("r", 2)
		.merge(circles)
		.transition()
		.on("start", function () {
			d3.select(this)
			  .attr("r", 4);
		  })
		.attr("cx", d => xScale(d.time))
		.attr("cy", d => yScale(d.high))
		.on("end", function () {
			d3.select(this)
			  .attr("r", 2);
		  });
		  
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