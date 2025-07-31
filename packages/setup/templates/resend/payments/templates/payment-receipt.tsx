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
	Hr
} from '@react-email/components'

import { Title, ChargeDetails, Actions, TransactionId, Summary } from '../components'

const invoiceDetails = {
	description: 'Landing page for new product',
	link: '/invoices/fc9ae3',
	items: [
		{
			name: 'Web Design',
			qty: 1,
			units: null,
			price: 250
		},
		{
			name: 'Hosting & Analytics',
			qty: 1,
			units: 'month',
			price: 50
		},
		{
			name: 'Content Design & Publishing',
			qty: 6,
			units: 'pages',
			price: 500
		}
	]
}

const Receipt = () => {
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
						<Title primaryText="Receipt" secondaryText="from Light Dance" />

						<Section className="mt-6 mb-24 w-full">
							<Text className="my-1 text-[16px] font-normal tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">
								Your payment was successfully received
							</Text>

							<ChargeDetails
								amount={470}
								text="was charged to the card"
								cardLastFourString="9945"
							/>
						</Section>

						<Actions actionText="Download Receipt" />

						<Section className="w-full">
							<TransactionId id="LF P6002" />
						</Section>

						<Hr className="mb-0 border-neutral-300 dark:border-neutral-700" />

						<Summary />
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}

export default Receipt
