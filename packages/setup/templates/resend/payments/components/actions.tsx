import * as React from 'react'
import { Text, Section, Link } from '@react-email/components'

export const Actions = ({
	primaryText = 'Reply to this email with any questions or concerns',
	actionText = 'Update Payment Method',
	href = '/'
}) => {
	return (
		<Section className="mt-4 mb-0 mb-8">
			<Text className="my-0 text-[14px] text-neutral-700 dark:text-neutral-300">{primaryText}</Text>
			<Text className="my-0 text-[14px]">
				<Link
					href={href}
					className="m-0 my-0 text-left text-[14px] text-neutral-500 underline dark:text-neutral-400"
				>
					{actionText}
				</Link>
			</Text>
		</Section>
	)
}
