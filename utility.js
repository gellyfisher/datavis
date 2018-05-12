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
		numPoints=Math.min(40,amount*24);
		start.setDate(end.getDate()-amount);
	} else if (type==="M") {
		numPoints=40;
		start.setMonth(end.getMonth()-amount);
	} else if (type==="Y") {
		numPoints=40;
		start.setFullYear(end.getFullYear()-amount);
	}
	requestMultipleData();
}

function getY(i) { //hulp functie om de y coordinaat op een gegeven x coordinaat te bepalen van de ide kromme
	let lines=document.getElementsByClassName('line_class');
	let beginning = 0,
			end = lines[i].getTotalLength(),
			target;
	let pos;

	while (true){
	  target = Math.floor((beginning + end) / 2);
	  pos = lines[i].getPointAtLength(target);
	  if ((target === end || target === beginning) && pos.x !== mouseCoordX) {
		  break;
	  }
	  if (pos.x >  mouseCoordX)      end = target;
	  else if (pos.x <  mouseCoordX) beginning = target;
	  else break; //position found
	}
	return pos.y;
}