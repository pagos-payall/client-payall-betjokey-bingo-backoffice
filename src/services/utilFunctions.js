export function validateNoLeftZero(value) {
	if (value.slice(0, 2) === '00') return false
	if (value[0] === '0' && +value[1] >= 1) return false

	return true
}
