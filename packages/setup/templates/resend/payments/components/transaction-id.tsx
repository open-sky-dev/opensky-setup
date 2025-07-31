import * as React from 'react'
import { Text } from '@react-email/components'

export const TransactionId = ({ id = 'LF P6002' }) => {
	return (
		<Text className="my-1 w-fit rounded-[8px] bg-black px-2 py-0 font-mono text-[14px] font-medium tracking-tight text-white dark:bg-neutral-100 dark:text-neutral-900">
			<span className="mr-1 text-neutral-400">#</span>
			{id}
		</Text>
	)
}
