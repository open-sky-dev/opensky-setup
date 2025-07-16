import { PUBLIC_URL_ASSETS } from '$env/static/public'

/**
 * Constructs a full URL for an asset based on the public asset base URL.
 *
 * This function is useful for referencing static assets such as images, fonts, or other resources
 * that are served from a specific public directory defined by `PUBLIC_URL_ASSETS`.
 *
 * @param {string} path - The relative path to the asset (e.g., `'/images/logo.png'`).
 * @returns {string} The full URL to the asset (e.g., `'https://example.com/assets/images/logo.png'`).
 *
 * @example
 * const logoUrl = assetUrl('images/logo.png')
 * console.log(logoUrl) // Outputs something like "https://example.com/assets/images/logo.png"
 */
export function assetUrl(path: string) {
	return `${PUBLIC_URL_ASSETS}${path}`
}
