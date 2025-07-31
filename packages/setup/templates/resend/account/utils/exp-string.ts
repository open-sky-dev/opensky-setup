export function expirationString(maxAgeMins: number, timezone: string = 'UTC'): string {
	// Calculate expiration time based on maxAgeMins
	const expiresAt = new Date(Date.now() + maxAgeMins * 60 * 1000)

	// Format the expiration time in the user's timezone
	const timeFormatter = new Intl.DateTimeFormat('en-US', {
		hour: 'numeric',
		minute: 'numeric',
		timeZone: timezone,
		hour12: true
	})

	// Get timezone abbreviation
	const timeZoneFormatter = new Intl.DateTimeFormat('en-US', {
		timeZoneName: 'short',
		timeZone: timezone
	})

	const timeZoneParts = timeZoneFormatter.formatToParts(expiresAt)
	const timeZoneAbbr = timeZoneParts.find((part) => part.type === 'timeZoneName')?.value || ''

	return timeFormatter.format(expiresAt) + ' ' + timeZoneAbbr
}
