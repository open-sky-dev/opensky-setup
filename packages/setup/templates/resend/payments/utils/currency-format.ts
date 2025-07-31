export function formatCurrency(amount: number): string {
	return (
		'$' +
		parseFloat(amount.toString()).toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		})
	)
}

export function formatCurrencyCompact(amount: number): string {
	if (Number.isInteger(amount)) {
		// No decimal places, return as whole number
		return (
			'$' +
			parseFloat(amount.toString()).toLocaleString('en-US', {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			})
		)
	} else {
		return (
			'$' +
			parseFloat(amount.toString()).toLocaleString('en-US', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			})
		)
	}
}
