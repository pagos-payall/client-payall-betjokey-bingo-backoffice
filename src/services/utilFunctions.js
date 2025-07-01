export function validateNoLeftZero(value) {
	if (value.slice(0, 2) === '00') return false
	if (value[0] === '0' && +value[1] >= 1) return false

	return true
}

export function formatCurrency(value) {
	if (!value && value !== 0) return '$0';
	return new Intl.NumberFormat('es-ES', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
}

export function formatNumber(value) {
	if (!value && value !== 0) return '0';
	return new Intl.NumberFormat('es-ES').format(value);
}
