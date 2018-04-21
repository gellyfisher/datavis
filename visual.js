

function getData() {
	data=$.ajax({
	    type: "GET", 
	    url: "https://min-api.cryptocompare.com/data/histoday?fsym=ETH&tsym=BTC&limit=30&aggregate=1&toTs=1452680400&extraParams=datavis"
	})
	console.log(data);
}

getData();
