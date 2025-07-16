// Used to define classes for mixtures of variants
type CompoundRule = {
	[variantGroup: string]: string
	classes: string
}
// Each individual variant group with multiple rules and an optional default
type VariantGroupOptions = {
	[key: string]: string | undefined
	_default?: string
}

type VariantOptions = {
	base: string
	// Optional Properties
	reset?: string
	compound?: CompoundRule[] | undefined
	// Variant Groups
	[variantGroup: string]: string | VariantGroupOptions | CompoundRule[] | undefined
}

// Type describing what will be passed form rest props
interface VariantProps {
	resetStyles?: boolean | string
	[prop: string]: boolean | string | number | undefined
}

// Type describing what will be returned by the function
interface VariantResult {
	classes: string
	[variantProp: string]: string | boolean | number | undefined
}

export function createVariants(options: VariantOptions, props: VariantProps): VariantResult {
	// Object to return with classes and variant values
	const result: VariantResult = {
		classes: ''
	}

	// Add properties for each variant type
	Object.keys(options)
		.filter((key) => key !== 'base' && key !== 'reset' && key !== 'compound')
		.forEach((key) => {
			result[key] = undefined
		})

	// Check if reset is being applied
	if (props.resetStyles !== undefined) {
		result.classes = options.reset || ''

		// Mark all other variant properties as reset
		Object.keys(result).forEach((key) => {
			if (key !== 'classes') {
				result[key] = '_reset'
			}
		})

		return result
	}
	// Otherwise if not reset

	// Start by applying base classes
	let classList = options.base || ''

	// Process each variant group
	for (const [groupName, groupOptions] of Object.entries(options)) {
		// Skip base, compound, reset properties
		if (groupName === 'base' || groupName === 'compound' || groupName === 'reset') continue

		// Skip if not an object
		if (typeof groupOptions !== 'object' || groupOptions === null || Array.isArray(groupOptions)) {
			continue
		}

		// Check if this variant was passed as a prop
		const propValue = props[groupName]
		if (propValue !== undefined) {
			// Store the selected variant value
			if (typeof propValue === 'string') {
				result[groupName] = propValue
				// Add classes if this variant exists in the definition
				if (groupOptions[propValue]) {
					classList += ' ' + groupOptions[propValue]
				}
				// If it's a string but not a defined variant, use directly as a class
				else {
					classList += ' ' + propValue
				}
			} else if (propValue === true) {
				// Handle boolean true case (enable the variant without specifying a value)
				result[groupName] = groupName
				classList += ' ' + groupName
			}
		} else if (groupOptions._default) {
			// No prop passed, use default if available

			const defaultValue = groupOptions._default

			if (groupOptions[defaultValue]) {
				result[groupName] = defaultValue
				classList += ' ' + groupOptions[defaultValue]
			} else {
				result[groupName] = '_custom'
				classList += ' ' + defaultValue
			}
		}
	}

	// Process compound variants
	if (options.compound) {
		for (const compound of options.compound) {
			// Check if all conditions in this compound variant match
			const isMatch = Object.entries(compound).every(([key, value]) => {
				// Skip the 'classes' property
				if (key === 'classes') return true
				return result[key] === value
			})
			// If all conditions match, add the compound classes
			if (isMatch && compound.classes) {
				classList += ' ' + compound.classes
			}
		}
	}

	// Store the final class string
	result.classes = classList.trim()
	return result
}
