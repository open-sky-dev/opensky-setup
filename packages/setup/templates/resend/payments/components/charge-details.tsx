import * as React from 'react'
import { Text } from '@react-email/components'
import { formatCurrency } from '../utils/currency-format'

export const ChargeDetails = ({
	amount = 450,
	text = 'will be charged to the card',
	cardLastFourString = '9945'
}) => {
	return (
		<Text className="my-0 text-[17px] font-medium tracking-[-0.01em] text-neutral-800 dark:text-neutral-50">
			{formatCurrency(amount)} {text} &bull;&bull;{cardLastFourString}
		</Text>
	)
}
