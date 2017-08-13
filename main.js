var portfolio = {
	init: function() {
		this.twentyFourHoursAgo = Date.now() - 86400000;
		this.fiveMinutesInMilliseconds = 300000;
		this.lastUpdated = new Date();
		this.relevantCurrencies = [];
		this.fetchTopTenCurrencies();
	},
	calculateReturnRate: function() {
		debugger;
	},
	collectProximateSlots: function(timeSlots) {
		var closestTime = [];
		timeSlots.forEach(function(slot, i) {
			var dateInMilliseconds = slot[0];
			if (dateInMilliseconds - this.twentyFourHoursAgo < this.fiveMinutesInMilliseconds) {
				closestTime.push(slot)
			}
		}, this);
		return this.compareClosestSlots(closestTime, this.twentyFourHoursAgo)
	},
	collectValues: function() {
		var rows = document.querySelectorAll('.balance');
		for (var i = 0; i < rows.length; i++) {
			this.relevantCurrencies.forEach(function(e, i) {
				if (e.shortName === rows[i].id) {
					e.balance = parseInt(rows[i].value);
				}
			})
		}
		this.fetchHistory();
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

		return closestWithinFiveMinutes;
	},
	findDifference: function(timeSlot, twentyFourHoursAgo) {
		return Math.abs(twentyFourHoursAgo - timeSlot);
	},
	fetchHistory: function() {
		var self = this;
		var promises = this.relevantCurrencies.filter(function(currency, i) {
			return currency.balance > 0
				// .then(function(timeSlots) {
				// 	currency.comparisonInfo = self.collectProximateSlots(timeSlots);
					 // currenciesResolved++;
				// })

		}).map(function(currency) {
			return axios.get('http://www.coincap.io/history/1day/' + currency.shortName)
		})
		axios.all(promises).then(function(promise) {
			self.relevantCurrencies.forEach(function(currency, i) {
				var currencyWithReturnedData = promise[i];
				// var currencyRequiringUpdate = promise[i].config.url.substr(-3);
				if (currencyWithReturnedData) {
					if (promise[i].config.url.substr(-3) === currency.shortName && currencyWithReturnedData.data) {
						currency.comparisonInfo = self.collectProximateSlots(currencyWithReturnedData.data.price);
					}
				}
			})
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
			inputNode.className = "balance";
			inputNode.value = "0";

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
				this.relevantCurrencies.push(new Currency(currency.long, currency.price, currency.short, this.lastUpdated));
			}
		}, this)
	}
}
portfolio.init();
// portfolio.fetchHistory();