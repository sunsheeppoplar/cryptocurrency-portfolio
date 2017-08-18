function Price(amount) {
	this.amount = amount;
	this.decimalLength = function() {
		return this.amount.toString().split('.')[1].length
	}
}