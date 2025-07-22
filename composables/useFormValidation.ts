import { reactive, computed } from 'vue'

export interface ValidationRule<T = any> {
    validator: (value: T) => boolean
    message: string
}

export interface FieldRules {
    [key: string]: ValidationRule[]
}

export interface FormState {
    data: Record<string, any>
    errors: Record<string, string>
    touched: Record<string, boolean>
}

export function useFormValidation<T extends Record<string, any>>(
    initialData: T,
    rules: FieldRules = {}
) {
    const formState = reactive<FormState>({
        data: { ...initialData },
        errors: {},
        touched: {}
    })

    const isFormValid = computed(() => {
        const hasNoErrors = Object.values(formState.errors).every(error => error === '')
        const hasRequiredFields = Object.keys(formState.data).every(key => {
            if (rules[key]) {
                const value = formState.data[key]
                return value !== '' && value != null
            }
            return true
        })

        return hasNoErrors && hasRequiredFields
    })

    const validateField = (fieldName: string): boolean => {
        const value = formState.data[fieldName]
        const fieldRules = rules[fieldName] || []

        formState.touched[fieldName] = true

        for (const rule of fieldRules) {
            if (!rule.validator(value)) {
                formState.errors[fieldName] = rule.message
                return false
            }
        }

        formState.errors[fieldName] = ''
        return true
    }

    const validateAllFields = (): boolean => {
        let isValid = true

        Object.keys(formState.data).forEach(fieldName => {
            const fieldIsValid = validateField(fieldName)
            if (!fieldIsValid) isValid = false
        })

        return isValid
    }

    const resetField = (fieldName: string): void => {
        formState.errors[fieldName] = ''
        formState.touched[fieldName] = false
    }

    const resetForm = (): void => {
        // Reset data to initial values
        Object.assign(formState.data, initialData)

        // Clear all errors and touched states
        Object.keys(formState.data).forEach(key => {
            formState.errors[key] = ''
            formState.touched[key] = false
        })
    }

    const setFieldValue = (fieldName: string, value: any): void => {
        formState.data[fieldName] = value
    }

    const setFormData = (data: Partial<T>): void => {
        Object.assign(formState.data, data)
    }

    // Helper function to check if field has been touched and has error
    const hasFieldError = (fieldName: string): boolean => {
        return formState.touched[fieldName] && Boolean(formState.errors[fieldName])
    }

    // Helper function to get field error message
    const getFieldError = (fieldName: string): string => {
        return hasFieldError(fieldName) ? formState.errors[fieldName] : ''
    }

    // Typed getter for form data (maintains type safety when accessing the data)
    const getFormData = (): T => {
        return formState.data as T
    }

    return {
        formState,
        isFormValid,
        validateField,
        validateAllFields,
        resetField,
        resetForm,
        setFieldValue,
        setFormData,
        hasFieldError,
        getFieldError,
        getFormData
    }
}

// Common validation rules with better type safety
export const validationRules = {
    required: (message = 'This field is required'): ValidationRule => ({
        validator: (value: any): boolean => {
            if (typeof value === 'string') return value.trim() !== ''
            if (typeof value === 'number') return !isNaN(value)
            return value != null && value !== ''
        },
        message
    }),

    email: (message = 'Please enter a valid email address'): ValidationRule => ({
        validator: (value: string): boolean => {
            if (!value) return true
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            return emailRegex.test(value.trim())
        },
        message
    }),

    minLength: (length: number, message?: string): ValidationRule => ({
        validator: (value: string): boolean => {
            return !value || value.trim().length >= length
        },
        message: message ?? `Must be at least ${length} characters`
    }),

    maxLength: (length: number, message?: string): ValidationRule => ({
        validator: (value: string): boolean => {
            return !value || value.trim().length <= length
        },
        message: message ?? `Must be no more than ${length} characters`
    }),

    pattern: (regex: RegExp, message: string): ValidationRule => ({
        validator: (value: string): boolean => {
            return !value || regex.test(value.trim())
        },
        message
    }),

    zipCode: (message = 'Please enter a valid ZIP code (12345 or 12345-6789)'): ValidationRule => ({
        validator: (value: string): boolean => {
            if (!value) return false
            return /^\d{5}(-\d{4})?$/.test(value.trim())
        },
        message
    }),

    creditCard: (message = 'Please enter a valid card number'): ValidationRule => ({
        validator: (value: string): boolean => {
            if (!value) return false

            const sanitized = value.replace(/\s+/g, '')

            // Check if it contains only digits and has valid length
            if (!/^\d+$/.test(sanitized) || sanitized.length < 13 || sanitized.length > 19) {
                return false
            }

            // Luhn algorithm for credit card validation
            let sum = 0
            let shouldDouble = false

            for (let i = sanitized.length - 1; i >= 0; i--) {
                let digit = parseInt(sanitized.charAt(i), 10)

                if (shouldDouble) {
                    digit *= 2
                    if (digit > 9) digit -= 9
                }

                sum += digit
                shouldDouble = !shouldDouble
            }

            return sum % 10 === 0
        },
        message
    }),

    expiryDate: (message = 'Please enter a valid expiry date (MM/YY)'): ValidationRule => ({
        validator: (value: string): boolean => {
            if (!value) return false

            const parts = value.split('/')
            if (parts.length !== 2) return false

            const [monthStr, yearStr] = parts
            if (!monthStr || !yearStr || monthStr.length !== 2 || yearStr.length !== 2) return false

            const month = parseInt(monthStr, 10)
            const year = parseInt(yearStr, 10) + 2000

            if (month < 1 || month > 12) return false

            const now = new Date()
            const currentYear = now.getFullYear()
            const currentMonth = now.getMonth() + 1 // getMonth() is 0-indexed

            // Check if the expiry date is in the future
            return year > currentYear || (year === currentYear && month >= currentMonth)
        },
        message
    }),

    cvv: (message = 'Please enter a valid CVV'): ValidationRule => ({
        validator: (value: string): boolean => {
            if (!value) return false
            return /^\d{3,4}$/.test(value.trim())
        },
        message
    })
} as const

// Address validation rules factory
export const createAddressValidationRules = (): FieldRules => ({
    firstName: [validationRules.required('First name is required')],
    lastName: [validationRules.required('Last name is required')],
    address: [validationRules.required('Street address is required')],
    city: [validationRules.required('City is required')],
    state: [validationRules.required('State is required')],
    zipCode: [
        validationRules.required('ZIP code is required'),
        validationRules.zipCode()
    ]
})

// Credit card validation rules factory
export const createCreditCardValidationRules = (): FieldRules => ({
    cardNumber: [
        validationRules.required('Card number is required'),
        validationRules.creditCard()
    ],
    expiryDate: [
        validationRules.required('Expiry date is required'),
        validationRules.expiryDate()
    ],
    cvv: [
        validationRules.required('CVV is required'),
        validationRules.cvv()
    ],
    cardName: [validationRules.required('Name on card is required')]
})