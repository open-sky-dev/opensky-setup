import * as React from 'react'
import {
	Body,
	Preview,
	Container,
	Head,
	Html,
	Section,
	Text,
	Tailwind,
	Link
} from '@react-email/components'

import { Title, SubscriptionItem } from '../components'

const ConfirmChangeEmail = () => {
	return (
		<Html>
			<Preview>To update your email, confirm with the code</Preview>
			<Tailwind>
				<Head>
					<meta name="color-scheme" content="light dark" />
					<meta name="supported-color-schemes" content="light dark" />
				</Head>
				<Body className="bg-white pt-[18px] pb-[150px] font-sans dark:bg-neutral-900">
					<Container className="mx-auto max-w-[500px] px-1">
						<Title primaryText="Subscription Expiring" secondaryText="from Light Dance" />

						<Section className="mt-6 mb-4 w-full">
							<Text className="my-1 text-[16px] font-normal tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">
								Next Tuesday <span className="text-neutral-500 dark:text-neutral-400">May 6th</span>
							</Text>

							<Text className="my-0 text-[17px] font-medium tracking-[-0.01em] text-neutral-800 dark:text-neutral-50">
								Your subscription will expire
							</Text>
						</Section>

						<SubscriptionItem />

						<Section className="mt-10">
							<Section className="mt-4 mb-0 mb-8">
								<Text className="my-0 text-[14px] text-neutral-700 dark:text-neutral-300">
									Auto-renew is disabled. You will lose access on May 6th
								</Text>
								<Text className="my-0 mt-5 text-[14px]">
									<Link
										href="/"
										className="m-0 rounded-[8px] bg-black px-3 py-2 text-left text-[14px] text-white dark:bg-neutral-100 dark:text-neutral-900"
									>
										Renew Subscription
									</Link>
								</Text>
							</Section>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}

export default ConfirmChangeEmail
