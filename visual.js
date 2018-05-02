let data; //our actual data
let NUM_POINTS=30; //amount of data points to fetch
let end=new Date(); //end date of the data we're getting
let start = new Date(); //start date of the data we're getting
start.setDate(end.getDate()-NUM_POINTS);

let minimumDate=new Date(2009,0,1,0,0,0,0).getTime(); //1 januari 2009 (eerste cryptocurrency was in 2009)

const width = 600;
const height = 300;
const padding = {top: 20, left: 40, right: 40, bottom: 50}; //deze waardes kunnen nog aangepast worden

let graphType="candle";

$(document).ready(function() {
	$("#graph-type").val(graphType); //set initial value of the dropdown
	
	$("#graph-type").change(function () {
		graphType = this.value; //the selected value
		$("#graph").empty();
		setUp();
		requestData();
	});
	
    setUp();
	requestData();
});

function requestData(currency="BTC") {	
	let url="https://min-api.cryptocompare.com/data/histo";
	let amount;
	
	let timeInBetween=(end-start)/(60*1000*NUM_POINTS)
	let endTimeStamp=Math.floor(end.getTime() / 1000);
	endTimeStamp-=endTimeStamp%3600 //fix it for hourly data
		
	if (timeInBetween>=24*60) {
		url+="day";
		amount=Math.round(timeInBetween/1440);
	} else if (timeInBetween>0) {
		url+="hour";
		amount=Math.ceil(timeInBetween/60);
	} else {
		throw "invalid timeInBetween for the data request";
	}
	
	params={
	    fsym: currency, 
	    tsym: "EUR",
		limit: NUM_POINTS,
	    aggregate: amount, //amount of days/hours/minutes in between data points
		toTs: endTimeStamp //last unix timestamp included
	}
	
	$.ajax({
	    type: "GET", 
	    url: url,
		data: params,
	    success : handleData 
	});
}

function handleData(recv) {
	if (recv.Response==="Error") {
		throw "Error: "+recv.Message
		
	} else if (recv.Response==="Success") {
		data=recv.Data;
		data.forEach(function(d) { d.time = new Date(d.time * 1000); });
		console.log(data);
		
		updateGraphs();
		
	} else {
		throw "Unknown response message: "+recv.Response
	}
}

function setUp() {
<<<<<<< HEAD
	graph=d3.select("#graph1")
		.append("svg")
		.attr("width", width)
		.attr("height", height);
		
	graph.append("text")
		.attr("y", padding.top - 5)
		.text("scroll up")
		.style("cursor", "hand")
		.on("click", scrollUp);
		
	graph.append("text")
		.attr("y", padding.top - 5)
		.attr("x", 70)
		.text("scroll down")
		.style("cursor", "hand")
		.on("click", scrollDown);
		
	graph.append("text")
		.attr("y", padding.top - 5)
		.attr("x", 200)
		.text("drag left")
		.style("cursor", "hand")
		.on("click", dragLeft);
		
	graph.append("text")
		.attr("y", padding.top - 5)
		.attr("x", 270)
		.text("drag right")
		.style("cursor", "hand")
		.on("click", dragRight);

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
	NUM_POINTS=Math.max(10,Math.ceil(NUM_POINTS/1.4)); //make sure theres enough points remaining
	var dist=(end-start)/4;
	
	start=new Date(start.getTime()+dist);
	end=new Date(end.getTime()-dist);
	
	requestData();
}

function scrollDown() {
	NUM_POINTS=Math.min(100,Math.floor(NUM_POINTS*1.4)); //limit the amount of points
	var dist=(end-start)/2;
	
	start=new Date(Math.max(start.getTime()-dist,minimumDate));
	end=new Date(Math.min(end.getTime()+dist,(new Date()).getTime()));
	
	requestData();
}

function dragRight(dist=86400000) { //in dit geval gaan we terug in de tijd
	dist=Math.min(dist,start.getTime()-minimumDate);
	
	start=new Date(start.getTime()-dist);
	end=new Date(end.getTime()-dist);
	
	requestData();
}

function dragLeft(dist=86400000) { // nu gaan we vooruit in de tijd
	dist=Math.min(dist,(new Date()).getTime()-end.getTime());
	
	start=new Date(start.getTime()+dist);
	end=new Date(end.getTime()+dist);
	
	requestData();
=======
	if (graphType==="candle") {
		setUpCandleChart();
	} else if (graphType==="donut") {
		//functie voor setup van donut
	} else if (graphType==="line") {
		setUpLineChart();
	} else {
		throw "Invalid graph type.";
	} 
>>>>>>> 8a6cda8216eb8ffc4a1d2bd6d31ab310d9ed22fc
}

function updateGraphs() {
	if (graphType==="candle") {
		drawCandleChart();
	} else if (graphType==="donut") {
		//functie om donut te tekenen
	} else if (graphType==="line") {
		drawLineChart();
	} else {
		throw "Invalid graph type.";
	} 
}