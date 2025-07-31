import * as React from 'react'
import { Text, Section, Heading } from '@react-email/components'

export const HeaderGroup = ({ headingText, descriptiveText }) => {
	return (
		<Section>
			<Heading className="m-0 pb-2 text-left text-[19px] font-[590] tracking-[-0.01em] text-neutral-800 dark:text-white">
				{headingText}
			</Heading>

			<Text className="m-0 mb-[32px] text-left text-[16px] tracking-[-0.01em] text-neutral-500 dark:text-neutral-400">
				{descriptiveText}
			</Text>
		</Section>
	)
}
