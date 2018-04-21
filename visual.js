

function getData() {
	data=$.get("https://min-api.cryptocompare.com/data/histoday?fsym=BTC&tsym=USD&limit=30&aggregate=3&e=CCCAGG");
	console.log(data);
}

getData();
