function getHistory() {
	axios.get('http://www.coincap.io/history/1day/ETH').then(function(timeSlots) {
		collectProximateSlots(timeSlots)
	})
}

function collectProximateSlots(timeSlots) {
	var twentyFourHoursAgo = Date.now() - 86400000;
	var closestTime = [];
	var fiveMinutesInMilliseconds = 300000;

	timeSlots.data.price.forEach(function(slot, i) {
		var dateInMilliseconds = slot[0];

		if (dateInMilliseconds - twentyFourHoursAgo < fiveMinutesInMilliseconds) {
			closestTime.push(slot)
		}
	})

	compareClosestSlots(closestTime, twentyFourHoursAgo)
}

function compareClosestSlots(slotsArray, twentyFourHoursAgo) {
	var firstTimeDifference, secondTimeDifference, firstClosestTime, secondClosestTime, closestWithinFiveMinutes, firstIndex, secondIndex;

	// last two are always closest times
	firstIndex = slotsArray.length - 1;
	secondIndex = slotsArray.length - 2;

	// 0 index is Unix epoch time, 1 is price
	firstClosestTime = slotsArray[firstIndex][0];
	secondClosestTime = slotsArray[secondIndex][0];

	firstTimeDifference = findDifference(firstClosestTime, twentyFourHoursAgo);
	secondTimeDifference = findDifference(secondClosestTime, twentyFourHoursAgo);

	if (firstTimeDifference > secondTimeDifference) {
		closestWithinFiveMinutes = slotsArray[secondIndex]
	} else {
		closestWithinFiveMinutes = slotsArray[firstIndex]
	}

	console.log(closestWithinFiveMinutes)
}

function findDifference(timeSlot, twentyFourHoursAgo) {
	return Math.abs(twentyFourHoursAgo - timeSlot);
}

getHistory();