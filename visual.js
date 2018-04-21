

function getData() {
	var dataTxt=$.ajax({
	    type: "GET", 
	    url: "https://min-api.cryptocompare.com/data/histoday?fsym=ETH&tsym=BTC&limit=30&aggregate=1&toTs=1452680400&extraParams=datavis"
	});
	console.log(dataTxt.responseText);
	var data = JSON.parse(dataTxt.responseText);
	console.log(data);
}

getData();
