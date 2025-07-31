import { sendEmail, type EmailSendResponse } from '../send-email'
import { StructuredResponse as Response } from '$utils/structured-response'

import AlertEmailChanged from './templates/alert-email-changed'
import VerifyCode from './templates/verify-code'
import VerifyLink from './templates/verify-link'

export async function changeEmailAlert({
	email,
	newEmail
}: {
	email: string
	newEmail: string
}): Promise<EmailSendResponse> {
	const result = await sendEmail(
		{
			from: 'LightDance <accounts@resend.notnotjake.com>',
			to: email,
			subject: 'Email Changed',
			react: AlertEmailChanged({ newEmail })
		},
		`Email changed. FROM:${email} | TO:${email}`
	)

	if (result?.success) {
		return Response.succeed(result?.data)
	} else {
		return Response.fail()
	}
}

export async function changeEmailVerify({
	newEmail,
	code,
	timezone = 'UTC',
	maxAgeMins = 5
}: {
	newEmail: string
	code: string
	timezone?: string
	maxAgeMins?: number
}): Promise<EmailSendResponse> {
	const headingText = 'Confirm New Email'
	const descriptiveText = 'Use this code to confirm your new email address.'
	const preview = `To update your email, confirm with the code ${code}. This code is available for ${maxAgeMins} minutes`

	const result = await sendEmail(
		{
			from: 'LightDance <accounts@resend.notnotjake.com>',
			to: newEmail,
			subject: 'Confirm New Email',
			react: VerifyCode({ code, timezone, maxAgeMins, headingText, descriptiveText, preview })
		},
		`Confirm email change: ${code}`
	)

	if (result?.success) {
		return Response.succeed(result?.data)
	} else {
		return Response.fail()
	}
}

export async function loginExistingUserWithCode({
	email,
	code,
	timezone = 'UTC',
	maxAgeMins = 5
}: {
	email: string
	code: string
	timezone?: string
	maxAgeMins?: number
}): Promise<EmailSendResponse> {
	const headingText = 'Log in to your account'
	const descriptiveText = 'Use this code to securely log in'
	const preview = `Use code ${code} to securely log in to your account. This code is available for ${maxAgeMins} minutes`

	const result = await sendEmail(
		{
			from: 'LightDance <accounts@resend.notnotjake.com>',
			to: email,
			subject: 'Login Code',
			react: VerifyCode({ code, timezone, maxAgeMins, headingText, descriptiveText, preview })
		},
		`Login code: ${code}`
	)

	if (result?.success) {
		return Response.succeed(result?.data)
	} else {
		return Response.fail()
	}
}

export async function loginExistingUserWithLink({
	email,
	url,
	timezone = 'UTC',
	maxAgeMins = 5
}: {
	email: string
	url: string
	timezone?: string
	maxAgeMins?: number
}): Promise<EmailSendResponse> {
	const headingText = 'Log in to your account'
	const descriptiveText = 'Use this link to securely log in'
	const actionText = 'Sign In'
	const preview = `Here is your link to securely log in to your account. This link is available for ${maxAgeMins} minutes`

	const result = await sendEmail(
		{
			from: 'LightDance <accounts@resend.notnotjake.com>',
			to: email,
			subject: 'Login Link',
			react: VerifyLink({
				url,
				timezone,
				maxAgeMins,
				headingText,
				descriptiveText,
				actionText,
				preview
			})
		},
		`Login link: ${url}`
	)

	if (result?.success) {
		return Response.succeed(result?.data)
	} else {
		return Response.fail()
	}
}

export async function loginNewUserWithCode({
	email,
	code,
	timezone = 'UTC',
	maxAgeMins = 5
}: {
	email: string
	code: string
	timezone?: string
	maxAgeMins?: number
}): Promise<EmailSendResponse> {
	const headingText = 'Create your account'
	const descriptiveText = 'Use this code to activate your account'
	const preview = `Use code ${code} to finish creating your account. This code is available for ${maxAgeMins} minutes`

	const result = await sendEmail(
		{
			from: 'LightDance <accounts@resend.notnotjake.com>',
			to: email,
			subject: 'Verify Email',
			react: VerifyCode({ code, timezone, maxAgeMins, headingText, descriptiveText, preview })
		},
		`New account code: ${code}`
	)

	if (result?.success) {
		return Response.succeed(result?.data)
	} else {
		return Response.fail()
	}
}

export async function loginNewUserWithLink({
	email,
	url,
	timezone = 'UTC',
	maxAgeMins = 5
}: {
	email: string
	url: string
	timezone?: string
	maxAgeMins?: number
}): Promise<EmailSendResponse> {
	const headingText = 'Create your account'
	const descriptiveText = 'Use this link to activate your account'
	const actionText = 'Sign In'
	const preview = `Here is your link to finish creating your account. This link is available for ${maxAgeMins} minutes`

	const result = await sendEmail(
		{
			from: 'LightDance <accounts@resend.notnotjake.com>',
			to: email,
			subject: 'Verify Email',
			react: VerifyLink({
				url,
				timezone,
				maxAgeMins,
				headingText,
				descriptiveText,
				actionText,
				preview
			})
		},
		`New account link: ${url}`
	)

	if (result?.success) {
		return Response.succeed(result?.data)
	} else {
		return Response.fail()
	}
}

export async function verifyWithCode({
	email,
	code,
	verificationDescription,
	timezone = 'UTC',
	maxAgeMins = 5
}: {
	email: string
	code: string
	verificationDescription: string
	timezone?: string
	maxAgeMins?: number
}): Promise<EmailSendResponse> {
	const headingText = 'Verification Code'
	const descriptiveText = `Use this code to ${verificationDescription}`
	const preview = `Use code ${code} to ${verificationDescription}. This code is available for ${maxAgeMins} minutes`

	const result = await sendEmail(
		{
			from: 'LightDance <accounts@resend.notnotjake.com>',
			to: email,
			subject: 'Verification Code',
			react: VerifyCode({ code, timezone, maxAgeMins, headingText, descriptiveText, preview })
		},
		`${verificationDescription} code: ${code}`
	)

	if (result?.success) {
		return Response.succeed(result?.data)
	} else {
		return Response.fail()
	}
}

export async function verifyWithLink({
	email,
	url,
	verificationDescription,
	timezone = 'UTC',
	maxAgeMins = 5
}: {
	email: string
	url: string
	verificationDescription: string
	timezone?: string
	maxAgeMins?: number
}): Promise<EmailSendResponse> {
	const headingText = 'Verification Link'
	const descriptiveText = `Use this link to ${verificationDescription}`
	const actionText = 'Authorize'
	const preview = `Here is your link to ${verificationDescription}. This link is available for ${maxAgeMins} minutes`

	const result = await sendEmail(
		{
			from: 'LightDance <accounts@resend.notnotjake.com>',
			to: email,
			subject: 'Verification Link',
			react: VerifyLink({
				url,
				timezone,
				maxAgeMins,
				headingText,
				descriptiveText,
				actionText,
				preview
			})
		},
		`${verificationDescription} link: ${url}`
	)

	if (result?.success) {
		return Response.succeed(result?.data)
	} else {
		return Response.fail()
	}
}
