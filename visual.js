txt = $.ajax({
    url:'consolidated_coin_data.csv',
	async:false,
    success: function (data){}
});

const data = d3.csvParse(txt.responseText, function(d) { 
  return {
	entity: (d.Entity), 
	year: parseInt(d.Year),
	people: parseFloat(d.people)
  };
});

console.log(data)
