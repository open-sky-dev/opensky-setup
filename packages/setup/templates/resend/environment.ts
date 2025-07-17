import { NODE_ENV } from '$env/static/private'

// Set to true to send emails in DEV environment
const SEND_EMAILS_OVERRIDE: true | null = null

export const SUPRESS_EMAILS =
  SEND_EMAILS_OVERRIDE === true ? false : NODE_ENV === 'development'
