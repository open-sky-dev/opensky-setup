import * as React from 'react'
import { Text, Section } from '@react-email/components'

import { formatCurrency } from '../utils/currency-format'

export const SubscriptionItem = ({ itemName = 'Web Hosting', period = 'month', price = 25 }) => {
	return (
		<Section className="rounded-[8px] bg-neutral-100 px-4 py-3">
			<Text className="my-0 w-fit py-0 text-[18px] font-medium tracking-tight text-black dark:text-white">
				{itemName}
			</Text>
			<Text className="my-0 text-[16px]">
				{formatCurrency(price)} <span className="text-[12px]">/{period}</span>
			</Text>
		</Section>
	)
}
