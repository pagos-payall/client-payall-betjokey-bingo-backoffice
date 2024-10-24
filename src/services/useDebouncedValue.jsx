import { useState, useEffect } from 'react'

export const useDebounce = (value, delay = 1500) => {
	const [debouncedValue, setDebouncedValue] = useState(value)

	console.log(value)

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)

		return () => {
			clearTimeout(handler)
		}
	}, [value, delay])

	return debouncedValue
}
