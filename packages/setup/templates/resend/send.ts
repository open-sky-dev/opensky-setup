import { env } from '$env/dynamic/private'
import { StructuredResponse as Response } from '$utils/structured-response'
import type { CreateEmailOptions } from 'resend'
import { Resend } from 'resend'

import { SUPRESS_EMAILS } from './environment'
const RESEND_AUTH = env.RESEND_AUTH

const resend = new Resend(RESEND_AUTH)

export async function sendEmail(
  options: CreateEmailOptions,
  devMessage: string | undefined | null
): Promise<Response<{ id: string | undefined }>> {
  if (SUPRESS_EMAILS) {
    console.log(devMessage || 'Email supressed in dev without console message')
    return Response.succeed({ id: 'dev-simulated-send' })
  } else {
    const { error, data } = await resend.emails.send(options)

    if (error) {
      console.log(error)
      return Response.fail()
    }

    return Response.succeed({ id: data?.id })
  }
}

export type EmailSendResponse = Response<{ id: string | undefined }>
