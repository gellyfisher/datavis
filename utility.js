let minimumDate=new Date(2009,0,1,0,0,0,0).getTime(); //1 januari 2009 (eerste cryptocurrency was in 2009)
let y_axis_padding_multiplier = 0.35;

/* deze functie zal in de de array van currencies zoeken naar wat de longName is voor de opgegeven shortName*/
function findLongName(shortName) {
	for (let i=0;i<currencyNames.length;i++) {
		if (shortName===currencyNames[i].shortName) {
			return currencyNames[i].longName;
		}
	}

	return shortName; //in case we didn't find the longname we just return the short name as a default...
}

/* geeft de eerste kleurindex terug die nog niet in gebruik is */
function getFirstUnusedCurrencyIndex() {
	let i = 0;
	let vals = Object.values(currentCurrenciesObject)

	while (vals.includes(i)) {
		i = i + 1;
	}
	return i;
}

/*deze functie zal de tijds periode aanpassen en opnieuw data opvragen */
function changePeriod(amount,type) {
	start=new Date(end);
	if (type==="D") {
		numPoints=Math.min(100,amount*24);
		start.setDate(end.getDate()-amount);
	} else if (type==="M") {
		numPoints=100;
		start.setMonth(end.getMonth()-amount);
	} else if (type==="Y") {
		numPoints=100;
		start.setFullYear(end.getFullYear()-amount);
	}
	requestMultipleData();
}

/*hulp functie om de y coordinaat op een gegeven x coordinaat (muis coordinaat) te bepalen van de ide kromme*/
function getY(i, line_class) { 
	let lines=document.getElementsByClassName(line_class);
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

/*deze functie zullen we gebruiken om een kleur lichter/donkerder te maken
wordt gebruikt voor de barchart*/
function shadeColor(color, percent) {

    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;
    G = (G<255)?G:255;
    B = (B<255)?B:255;

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}

/*dit zal het formaat van de x-as duidelijker weergeven. Namelijk als de dagen te dicht op elkaar liggen zullen we ook het uur meegeven.*/
function setAxisTimeFormat(axis, data) {

	let first_date = data[0].data[0].time
	let numberOfDays = 14;
	let new_date = new Date(
								first_date.getFullYear(),
								first_date.getMonth(),
								first_date.getDate()+numberOfDays,
								first_date.getHours(),
								first_date.getMinutes(),
								first_date.getSeconds());

	let last_date = data[0].data[data[0].data.length - 1].time;

	if (new_date > last_date) {
		axis.tickFormat(time_format_hour);
	} else {
		axis.tickFormat(time_format_day);
	}

}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}


function getColorByCurrencyName(given_coin) {
	return cScale(currentCurrenciesObject[given_coin]);
}
