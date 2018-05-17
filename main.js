let numPoints=100; //amount of data points to fetch
let end=new Date(); //end date of the data we're getting
let start = new Date(); //start date of the data we're getting
start.setDate(end.getDate()-numPoints);
let grid_stroke_color = "#e8e8e8"

let last_requested_time_between = 0;

let width = Math.round(screen.width - 640);
const height = 350;
const padding = {top: 40, left: 60, right: 200, bottom: 50}; //padding voor line en compare graph

let MAX_COINS = 10;

let cScale =  d3.scaleOrdinal().range(d3.schemeCategory10);

let mouseCircleRadius = 6;

let time_format_day = d3.timeFormat("%b %e %Y");
let time_format_hour = d3.timeFormat("%b %e, %-H %p");

let dragging=false;
let prevTime=Date.now();

// list of all possible currencies together with their short name
let currencyNames=[{shortName:"XMR",longName :"Monero"},{shortName:"ETH",longName :"Ethereum"},{shortName:"BTC",longName :"Bitcoin"},{shortName:"STC",longName:"Swiftcoin"},
					{shortName:"MLN",longName :"Melon"},{shortName:"DASH",longName :"Dash"},{shortName:"LTC",longName:"Litecoin"},{shortName:"NMC",longName:"Namecoin"},
					{shortName:"XPM",longName:"Primecoin"},{shortName:"XRP",longName:"Ripple"},{shortName:"BCH",longName:"Bitcoin Cash"},{shortName:"ZEC",longName:"Zcash"},
					{shortName:"XZC",longName:"Zcoin"},{shortName:"ETC",longName:"Ethereum Classic"}];

let currentCurrenciesObject = {"XMR":0,"MLN":1,"LTC":2}

$(document).ready(function() {
	setUpHtml();
	setUp();
	requestMultipleData();
});

function getFirstUnusedCurrencyIndex() {
	let i = 0;
	let vals = Object.values(currentCurrenciesObject)

	while (vals.includes(i)) {
		i = i + 1;
	}
	return i;
}

let deselected_crypto_color = "#eee"
function setUpHtml() {

	$(document).keypress(function(e) {
		if(e.which == 13) {
			//swap views
			div1 = $('#line_graph');
			div2 = $('#compare_graph');

			tdiv1 = div1.clone();
			tdiv2 = div2.clone();

			div1.replaceWith(tdiv2);
			div2.replaceWith(tdiv1);
			$('#line_graph:parent').each(function () {
				$(this).insertBefore($(this).prev('.div1'));
			});
		}
	});

	for (let i=0;i<currencyNames.length;i++) {
		if (currencyNames[i].shortName in currentCurrenciesObject) { //these currencies are already selected
			let currencyName = currencyNames[i].shortName
			$("#cryptoSelected").append('<li value="'+currencyNames[i].shortName+'" style="background-color: ' + shadeColor(getColorByCurrencyName(currencyName),10)+ '" > ' + currencyNames[i].longName + '</li>');

		} else {
			$("#cryptoResult").append('<li value="'+currencyNames[i].shortName+'" style="background-color: ' + deselected_crypto_color + '" > ' + currencyNames[i].longName + '</li>');
		}
	}

	function selectCrypto() {
		if (Object.keys(currentCurrenciesObject).length >= MAX_COINS) {
			return ;
		}
		let val=$(this).attr('value');
		if (val in currentCurrenciesObject) {
			return false;
		}

		currentCurrenciesObject[val] = getFirstUnusedCurrencyIndex();

		requestMultipleData();

		$(this).prependTo("#cryptoSelected");
		$(this).unbind("click")
		$(this).click(deselectCrypto);
		$(this).css("background-color", getColorByCurrencyName(val))
		console.log($(this))

		filterResult();
	}

	function deselectCrypto() {
		let val=$(this).attr('value');
		delete currentCurrenciesObject[val]

		requestMultipleData();

		if (val===coin) { //this is the selected currency so we should remove the bar chart
			coin=null;
			d3.select("#volumes").style("visibility","hidden");
		}

		$(this).appendTo("#cryptoResult");
		$(this).unbind("click")
		$(this).click(selectCrypto);
		$(this).css("background-color", deselected_crypto_color)
		filterResult();
	}

	function filterResult() {
		let query=$("#cryptoSelecter").val();
		$("#cryptoResult li").filter(function (index) { // hide the elements not matching the query
			return !$(this).text().toLowerCase().includes(query.toLowerCase());
		  })
		.css( "display", "none" );

		$("#cryptoResult li").filter(function (index) { //show the elements that do match the query
			return $(this).text().toLowerCase().includes(query.toLowerCase());
		  })
		.css( "display", "block" )
	}

	$("#cryptoResult li").click(selectCrypto);
	$("#cryptoSelected li").click(deselectCrypto);
	$("#cryptoSelecter").keyup(filterResult);
}

function requestMultipleData() {
	let promises=[];

	let object_keys = Object.keys(currentCurrenciesObject)
	for (keyindex in object_keys) {
		promises.push(requestData(object_keys[keyindex]));
	}
	// Als alle requests gedaan zijn dan kunnen we de grafiek tekenen
	Promise.all(promises).then(function(data) {

		resultData=[];

		for (let i = 0; i < object_keys.length; i++) {
			if (data[i].Response==="Error") {
				throw "Error: "+data[i].Message

			} else if (data[i].Response==="Success") {
				//volgorde van de requests blijft bewaard in de data zelf (zie https://stackoverflow.com/questions/28066429/promise-all-order-of-resolved-values)
				data[i].Data.forEach(function(d) { d.time = new Date(d.time * 1000); });

				resultData.push({
					currency:object_keys[i],
					data:data[i].Data
				});

			} else {
				throw "Unknown response message: "+data[i].Response
			}
		}

		if (resultData===[]) {
			throw "no data available";
		} else {
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
	    tsym: "EUR",		// we're only interested in euro prices
		limit: numPoints,
	    aggregate: amount, //amount of days/hours in between data points (API ignores any value more than 30)
		toTs: endTimeStamp //last unix timestamp included
	}

	return $.ajax({
	    type: "GET",
	    url: url,
		data: params
	});
}

function setUp() {
	setUpLineChart();
	setUpComparisonChart();
	setUpBarChart();
	// setUpCandleChart();

	setupMouseEvents();
}

let saveData;

function updateGraphs(data) {

	last_requested_time_between = Math.abs(Date.parse(data[0].data[1].time) - Date.parse(data[0].data[0].time)) / 36e5

	saveData = data
	drawLineChart(data);
	drawComparisonChart(data);
	drawBarChart(data);
}
