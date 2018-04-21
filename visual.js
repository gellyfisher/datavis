var data;

function requestData(asyn=true) {
	var url="https://min-api.cryptocompare.com/data/histoday?fsym=ETH&tsym=EUR&limit=30&aggregate=1&toTs=1452680400&extraParams=datavis";
	//construct appropriate url with possible params...
	
	$.ajax({
	    type: "GET", 
	    url: url,
		async: asyn,
	    success : handleData 
	});
}

function handleData(recv) {
	data=recv.Data;
	data.forEach(function(d) { d.time = new Date(d.time * 1000); });
	
	console.log(data);
	//updateGraphs()
}

requestData(false);

const width = 600;
const height = 300;
const padding = {top: 20, left: 40, right: 40, bottom: 50};

var timeFormat = d3.timeFormat("%d/%m");

const graph=d3.select("body")
	.append("svg")
	.attr("width", width)
    .attr("height", height);

const xScale = d3.scaleTime()                      
  				.domain(d3.extent(data, d => d.time))
  				.range([padding.left, width - padding.right]);
  
const yScale = d3.scaleLinear()
  				.domain([0,d3.max(data, d => d.high)])
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
