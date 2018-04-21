

function requestData() {
	var url="https://min-api.cryptocompare.com/data/histoday?fsym=ETH&tsym=BTC&limit=30&aggregate=1&toTs=1452680400&extraParams=datavis";
	//construct appropriate url
	
	$.ajax({
	    type: "GET", 
	    url: url,
	    success : handleData
	});
}

function handleData(recv) {
	data=recv.Data
	console.log(data);
	console.log(data[2]["time"])
}

requestData();
