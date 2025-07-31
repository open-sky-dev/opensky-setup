import * as React from 'react'
import { Section, Text, Row, Column } from '@react-email/components'

export const Title = ({ primaryText = 'Upcoming Payment', secondaryText = 'to Light Dance' }) => {
	return (
		<Section className="text-neutral-800 dark:text-neutral-300">
			<Row>
				<Column>
					<Text className="text-[19px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-100">
						{primaryText}{' '}
						<span className="font-normal text-neutral-500 dark:text-neutral-400">
							{secondaryText}
						</span>
					</Text>
				</Column>
			</Row>
		</Section>
	)
}
