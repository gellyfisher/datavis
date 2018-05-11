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