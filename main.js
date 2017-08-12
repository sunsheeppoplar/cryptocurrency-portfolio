var portfolio = {
	init: function() {
		this.twentyFourHoursAgo = Date.now() - 86400000;
		this.relevantCurrencies = [];
		this.fetchTopTenCurrencies();
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
	collectValues: function() {
		console.log('hi')
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
	},
	fetchHistory: function() {
		var self = this;
		axios.get('http://www.coincap.io/history/1day/ETH').then(function(timeSlots) {
			self.collectProximateSlots(timeSlots);
		})
	},
	fetchTopTenCurrencies: function() {
		var self = this;
		axios.get('http://www.coincap.io/front').then(function(currencies) {
			self.store(currencies);
		}).then(function() {
			self.render();
		})
	},
	render: function() {
		var container = document.getElementById('container');
		var button = document.getElementById('submit');
		var loadingMessage = document.getElementById('loading');
		var header = document.getElementById('header');

		portfolio.relevantCurrencies.forEach(function(currency, i) {
			var row = document.createElement('div');
			row.className = "row";

			var textNode = document.createElement('div');
			textNode.innerHTML = currency.longName;
			textNode.className = "text"

			var inputNode = document.createElement('input');
			inputNode.id = currency.shortName;
			inputNode.className = "values";

			row.appendChild(textNode);
			row.appendChild(inputNode);

			container.insertBefore(row, button);
		})

		// magic
		loadingMessage.style.display = "none";
		header.style.visibility = "visible";
		button.style.visibility = "visible";
	},
	store: function(currencies) {
		currencies.data.forEach(function(currency, i) {
			if (i < 10) {
				this.relevantCurrencies.push(new Currency(currency.long, currency.price, currency.short));
			}
		}, this)
	}
}
portfolio.init();
// portfolio.fetchHistory();