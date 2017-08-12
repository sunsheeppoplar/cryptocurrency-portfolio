var portfolio = {
	init: function() {
		this.twentyFourHoursAgo = Date.now() - 86400000;
	},
	getHistory: function() {
		var self = this;
		axios.get('http://www.coincap.io/history/1day/ETH').then(function(timeSlots) {
			self.collectProximateSlots(timeSlots)
		})
	},
	collectProximateSlots: function(timeSlots) {
		var closestTime = [];
		var fiveMinutesInMilliseconds = 300000;

		timeSlots.data.price.forEach(function(slot, i) {
			var dateInMilliseconds = slot[0];
			if (dateInMilliseconds - this.twentyFourHoursAgo < fiveMinutesInMilliseconds) {
				closestTime.push(slot)
			}
		}, this);

		this.compareClosestSlots(closestTime, this.twentyFourHoursAgo)
	},
	compareClosestSlots: function(slotsArray, twentyFourHoursAgo) {
		var firstTimeDifference, secondTimeDifference, firstClosestTime, secondClosestTime, closestWithinFiveMinutes, firstIndex, secondIndex;

		// last two are always closest times
		firstIndex = slotsArray.length - 1;
		secondIndex = slotsArray.length - 2;

		// 0 index is Unix epoch time, 1 is price
		firstClosestTime = slotsArray[firstIndex][0];
		secondClosestTime = slotsArray[secondIndex][0];

		firstTimeDifference = this.findDifference(firstClosestTime, this.twentyFourHoursAgo);
		secondTimeDifference = this.findDifference(secondClosestTime, this.twentyFourHoursAgo);

		if (firstTimeDifference > secondTimeDifference) {
			closestWithinFiveMinutes = slotsArray[secondIndex]
		} else {
			closestWithinFiveMinutes = slotsArray[firstIndex]
		}

		console.log(closestWithinFiveMinutes)
	},

	findDifference: function(timeSlot, twentyFourHoursAgo) {
		return Math.abs(twentyFourHoursAgo - timeSlot);
	}
}
portfolio.init();
portfolio.getHistory();