import * as React from 'react'
import { Section, Text, Row, Column, Link } from '@react-email/components'
import { formatCurrency, formatCurrencyCompact } from '../utils/currency-format'

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

export const Summary = ({ details = invoiceDetails }) => {
	const totalItems = details.items.length
	const itemText = totalItems === 1 ? 'Item' : 'Items'

	return (
		<Section className="w-full">
			<Row className="mt-2 mb-3">
				<Column className="">
					<Text className="my-2 text-neutral-800 dark:text-neutral-100">
						{totalItems} {itemText}{' '}
						<span className="text-neutral-500 dark:text-neutral-400">{details.description}</span>
					</Text>
				</Column>
				<Column className="">
					<Text className="my-2 text-right">
						<Link
							href={details.link}
							className="m-0 text-left text-[14px] text-blue-600 underline dark:text-blue-500"
						>
							View Details
						</Link>
					</Text>
				</Column>
			</Row>
			{details.items.map((item, index) => (
				<Row key={index} className="">
					<Column className="">
						<Text className="my-1 font-light text-neutral-800 dark:text-neutral-300">
							{item.name}
							{(item.qty > 1 || item.units) && (
								<span className="ml-1 rounded-full bg-neutral-100 pr-2 pl-2 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-500">
									{item.units ? `${item.qty} ${item.units}` : `${item.qty}`}
								</span>
							)}
						</Text>
					</Column>
					<Column className="text-right align-top font-normal">
						<Text className="my-1 text-neutral-800 dark:text-neutral-200">${item.price}</Text>
					</Column>
				</Row>
			))}
		</Section>
	)
}
