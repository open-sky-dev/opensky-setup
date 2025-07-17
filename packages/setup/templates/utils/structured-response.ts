export type StructuredResponse<T> =
	| { success: true; data?: T; error?: never }
	| { success: false; data?: never; error?: unknown }

export const StructuredResponse = {
	succeed: <T>(data?: T): StructuredResponse<T> => {
		return { success: true, ...(data !== undefined && { data }) }
	},

	fail: (error?: unknown): StructuredResponse<never> => {
		return { success: false, ...(error !== undefined && { error }) }
	}
}
