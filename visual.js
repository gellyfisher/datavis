let numPoints=30; //amount of data points to fetch
let end=new Date(); //end date of the data we're getting
let start = new Date(); //start date of the data we're getting
start.setDate(end.getDate()-numPoints);

let minimumDate=new Date(2009,0,1,0,0,0,0).getTime(); //1 januari 2009 (eerste cryptocurrency was in 2009)

const width = 800;
const height = 400;
const padding = {top: 20, left: 60, right: 200, bottom: 50}; //deze waardes kunnen nog aangepast worden

let graphType="line";

// list of all possible currencies together with their short name
let currencyNames=[{shortName:"XMR",longName :"Monero"},{shortName:"ETH",longName :"Ethereum"},{shortName:"BTC",longName :"Bitcoin"},{shortName:"STC",longName:"Swiftcoin"},
					{shortName:"MLN",longName :"Melon"},{shortName:"DASH",longName :"Dash"},{shortName:"LTC",longName:"Litecoin"},{shortName:"NMC",longName:"Namecoin"},
					{shortName:"XPM",longName:"Primecoin"},{shortName:"XRP",longName:"Ripple"},{shortName:"BCH",longName:"Bitcoin Cash"},{shortName:"ZEC",longName:"Zcash"},
					{shortName:"TBC",longName:"Tonal Bitcoin"},{shortName:"XZC",longName:"Zcoin"},{shortName:"ETC",longName:"Ethereum Classic"}]; 
let currentCurrencies=["XMR","ETH","MLN"]; // a subset of the short names in currencyNames which will be drawn.

$(document).ready(function() {	
	setUpHtml();
	
    setUp();
	requestMultipleData();
});

function findLongName(shortName) {
	for (let i=0;i<currencyNames.length;i++) {
		if (shortName===currencyNames[i].shortName) {
			return currencyNames[i].longName;
		}
	}
	
	return shortName; //in case we didn't find the longname we just return the short name as a default...
}

function changePeriod(amount,type) {
	start=new Date(end);
	if (type==="D") {
		numPoints=Math.min(99,amount*24);
		start.setDate(end.getDate()-amount);
	} else if (type==="M") {
		numPoints=99;
		start.setMonth(end.getMonth()-amount);
	} else if (type==="Y") {
		numPoints=99;
		start.setFullYear(end.getFullYear()-amount);
	}
	requestMultipleData();
}

function setUpHtml() {
	$("#graph-type").val(graphType); //set initial value of the dropdown
	
	for (let i=0;i<currencyNames.length;i++) {
		if ($.inArray(currencyNames[i].shortName, currentCurrencies)!==-1) { //these currencies are already selected
			$("#cryptoSelected").append("<li value='"+currencyNames[i].shortName+"'>"+currencyNames[i].longName+"</li>");
			
		} else {
			$("#cryptoResult").append("<li value='"+currencyNames[i].shortName+"'>"+currencyNames[i].longName+"</li>");
		}
	}
	
	function selectCrypto() {
		let val=$(this).attr('value');
		currentCurrencies.push(val);
		$(this).prependTo("#cryptoSelected");
		$(this).unbind("click")
		$(this).click(deselectCrypto);
		requestMultipleData();
	}
	
	function deselectCrypto() {
		let val=$(this).attr('value');
		currentCurrencies.splice( $.inArray(val, currentCurrencies),1);
		$(this).appendTo("#cryptoResult");
		$(this).unbind("click")
		$(this).click(selectCrypto);
		requestMultipleData();
	}
	
	$("#cryptoResult li").click(selectCrypto);
	$("#cryptoSelected li").click(deselectCrypto);
	
	$("#cryptoSelecter").keyup(function() {
		let query=$(this).val();
		$("#cryptoResult li").filter(function (index) { // hide the elements not matching the query
			return !$(this).text().toLowerCase().includes(query.toLowerCase());
		  })
		.css( "display", "none" );
		
		$("#cryptoResult li").filter(function (index) { //show the elements that do match the query
			return $(this).text().toLowerCase().includes(query.toLowerCase());
		  })
		.css( "display", "block" )
	});
	
	
	//NOG INSTELLEN DAT JE VOOR EEN CANDLE MAAR EEN CURRENCY KAN SELECTEREN
	$("#graph-type").change(function () {
		graphType = this.value; //the selected value
		$("#graph").empty();
		setUp();
		requestMultipleData();
	});
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