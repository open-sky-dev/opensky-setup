import * as React from 'react'
import { Text, Section } from '@react-email/components'

export const Expires = ({ maxAgeMins, expiresAtString = '12:42 PM' }) => {
	return (
		<Section>
			<Text className="m-0 text-left text-[14px] leading-1 text-neutral-700 dark:text-neutral-200">
				This login will be available for {maxAgeMins} minutes
			</Text>

			<Text className="m-0 text-left text-[14px] text-neutral-500 dark:text-neutral-400">
				Expires at {expiresAtString}
			</Text>
		</Section>
	)
}
