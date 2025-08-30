import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

// import { authHandler } from '$lib/server/auth'

export const serverHook: Handle = async ({ event, resolve }) => {
	// Your hook code
	
	return resolve(event)
}


export const handle: Handle = sequence(serverHook)
