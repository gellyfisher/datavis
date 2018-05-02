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
	if (graphType==="candle") {
		setUpCandleChart();
	} else if (graphType==="donut") {
		setUpDonutChart()
	} else if (graphType==="line") {
		setUpLineChart();
	} else {
		throw "Invalid graph type.";
	}
}

function updateGraphs() {
	if (graphType==="candle") {
		drawCandleChart();
	} else if (graphType==="donut") {
		drawDonutChart([]);
	} else if (graphType==="line") {
		drawLineChart();
	} else {
		throw "Invalid graph type.";
	}
}
