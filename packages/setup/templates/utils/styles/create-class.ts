import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Helper function to use to mark non-tailwind classes to preserve
export const preserveClass = (classes: ClassValue) => ({ __preserved: classes })

/**
 * Merges and processes CSS class names using `clsx` and `tailwind-merge`,
 * while allowing preservation of specific non-Tailwind classes.
 *
 * @param inputs - Class values to merge, supporting strings, objects, and arrays.
 * @returns A string of merged and processed class names.
 *
 * @example
 * createClass('text-lg', 'text-sm')
 * // Returns: "text-sm" (last conflicting Tailwind class wins)
 *
 * @example
 * createClass('flex', preserveClass('custom-animation'))
 * // Returns: "flex custom-animation"
 */
export function createClass(...inputs: ClassValue[]) {
	// Filter out any preserved classes
	// Still runs clsx for preserved classes (so you can use conditionals)
	const preservedClasses: Array<string> = []
	const regularClasses = inputs.filter((input) => {
		if (input && typeof input === 'object' && '__preserved' in input) {
			preservedClasses.push(clsx(input.__preserved))
			return false
		}
		return true
	})

	return [twMerge(clsx(regularClasses)), ...preservedClasses].filter(Boolean).join(' ')
}
