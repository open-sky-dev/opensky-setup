import { sendEmail } from '../send-email'

import PaymentUpcoming from './templates/payment-upcoming'

export async function paymentUpcoming({ email }: { email: string }) {
	const result = await sendEmail(
		{
			from: 'LightDance <accounts@resend.notnotjake.com>',
			to: email,
			subject: 'Test',
			react: PaymentUpcoming()
		},
		`Payment upcoming.`
	)

	if (result?.success) {
		return { id: result?.data?.id }
	} else {
		return { success: false }
	}
}
