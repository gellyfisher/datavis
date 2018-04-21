var data;

function requestData(currency="BTC",timeInBetween=24*60,date=new Date()) {
	var url="https://min-api.cryptocompare.com/data/histo";
	var amount;
	
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
		limit: 30, //?? maybe more or less ?
	    aggregate: amount, //amount of days/hours/minutes in between data points
		toTs: Math.floor(date.getTime() / 1000) //unix timestamp
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
	
	console.log(data);
	updateGraphs()
}

const width = 600;
const height = 300;
const padding = {top: 20, left: 40, right: 40, bottom: 50};

var timeFormat = d3.timeFormat("%d/%m");

const graph=d3.select("body")
	.append("svg")
	.attr("width", width)
    .attr("height", height);

const xScale = d3.scaleTime()                      
  				.range([padding.left, width - padding.right]);
  
const yScale = d3.scaleLinear()
  				.range([height - padding.bottom, padding.top]);
					
const xAxis = d3.axisBottom() 
  				.scale(xScale)
				.tickFormat(timeFormat);
					
const yAxis = d3.axisLeft()
  				.scale(yScale);
				
graph.append("g") 
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height - padding.bottom})`)
    .call(xAxis);
  
graph.append("g") 
    .attr("class", "y axis")
    .attr("transform", `translate(${padding.left}, 0)`)
    .call(yAxis);

requestData();

function updateGraphs() {
	xScale.domain(d3.extent(data, d => d.time));
	yScale.domain([0,d3.max(data, d => d.high)]);
	
	graph.select(".x.axis")
      .transition()
      .call(xAxis);
    
    graph.select(".y.axis")
      .transition()
      .call(yAxis);
}
