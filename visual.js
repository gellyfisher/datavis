let numPoints=30; //amount of data points to fetch
let end=new Date(); //end date of the data we're getting
let start = new Date(); //start date of the data we're getting
start.setDate(end.getDate()-numPoints);

let minimumDate=new Date(2009,0,1,0,0,0,0).getTime(); //1 januari 2009 (eerste cryptocurrency was in 2009)

const width = 800;
const height = 400;
const padding = {top: 20, left: 40, right: 100, bottom: 50}; //deze waardes kunnen nog aangepast worden

let graphType="line";

let currencyNames=[{shortName:"XMR",longName :"Monero"},{shortName:"ETH",longName :"etherium"},{shortName:"BTC",longName :"bitcoin"},{shortName:"MLN",longName :"melon"},{shortName:"DASH",longName :"dash"}]; // all possible currencies
let currentCurrencies=["XMR","ETH","MLN"]; // a subset of the short names in currencyNames which will be drawn.

$(document).ready(function() {	
	setUpHtml();
	
    setUp();
	requestMultipleData();
});

function setUpHtml() {
	$("#graph-type").val(graphType); //set initial value of the dropdown
	
	for (let i=0;i<currencyNames.length;i++) {
		let checkbox=addCheckbox(currencyNames[i]);
		if ($.inArray(currencyNames[i].shortName, currentCurrencies)!==-1) {
			checkbox.prop('checked',true);
		}
		checkbox.change(function() {
			if(this.checked) {
				currentCurrencies.push(this.value);
			} else {
				currentCurrencies.splice( $.inArray(this.value, currentCurrencies),1);
			}
			
			requestMultipleData();
		});
	}
	
	//NOG INSTELLEN DAT JE VOOR EEN CANDLE MAAR EEN CURRENCY KAN SELECTEREN
	$("#graph-type").change(function () {
		graphType = this.value; //the selected value
		$("#graph").empty();
		setUp();
		requestMultipleData();
	});
}

function addCheckbox(name) {
   let container = $("#checkBoxContainer");
   let inputs = container.find('input');
   let id = inputs.length+1;

   let checkbox=$('<input />', { type: 'checkbox', id: 'cb'+id,name:'currencies', value: name.shortName }).appendTo(container);
   $('<label />', { 'for': 'cb'+id, text: name.longName }).appendTo(container);
   $('<br />').appendTo(container);
   return checkbox;
}

function requestMultipleData() {
	let promises=[];
	let result=[];
	
	for (let i = 0; i < currentCurrencies.length; i++) {
		promises.push(requestData(currentCurrencies[i]));
	}
	
	// Als alle requests gedaan zijn dan kunnen we de grafiek tekenen
	Promise.all(promises).then(function(data) {
		
		resultData=[];
		
		for (let i = 0; i < currentCurrencies.length; i++) {
			if (data[i].Response==="Error") {
				throw "Error: "+data[i].Message
				
			} else if (data[i].Response==="Success") {
				//volgorde van de requests blijft bewaard in de data zelf (zie https://stackoverflow.com/questions/28066429/promise-all-order-of-resolved-values)
				data[i].Data.forEach(function(d) { d.time = new Date(d.time * 1000); });
				
				resultData.push({
					currency:currentCurrencies[i],
					data:data[i].Data
				});
				
			} else {
				throw "Unknown response message: "+data[i].Response
			}
		}
		
		if (resultData===[]) {
			throw "no data available";
		} else {
			console.log(resultData);
			updateGraphs(resultData);
		}
		
	}, function(err) {
		throw err;
	});
}

function requestData(currency="BTC") {	
	let url="https://min-api.cryptocompare.com/data/histo";
	let amount;
	
	let timeInBetween=(end-start)/(60*1000*numPoints)
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
		limit: numPoints,
	    aggregate: amount, //amount of days/hours in between data points (API ignores any value more than 30)
		toTs: endTimeStamp //last unix timestamp included
	}
	
	return $.ajax({
	    type: "GET", 
	    url: url,
		data: params,
	});
}

function setUp() {
	if (graphType==="candle") {
		setUpCandleChart();
	} else if (graphType==="donut") {
		//functie voor setup van donut
	} else if (graphType==="line") {
		setUpLineChart();
	} else {
		throw "Invalid graph type.";
	} 
}

function updateGraphs(data) {
	if (graphType==="candle") {
		drawCandleChart(data[0].data);
	} else if (graphType==="donut") {
		//functie om donut te tekenen
	} else if (graphType==="line") {
		drawLineChart(data);
	} else {
		throw "Invalid graph type.";
	} 
}