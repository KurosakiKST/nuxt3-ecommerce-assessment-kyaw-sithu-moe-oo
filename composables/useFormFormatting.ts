export function useFormFormatting() {
    const formatCardNumber = (value: string): string => {
        // Remove all non-digits
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')

        // Add spaces every 4 digits
        const matches = v.match(/\d{4,16}/g)
        const match = matches && matches[0] || ''
        const parts = []

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4))
        }

        if (parts.length) {
            return parts.join(' ')
        } else {
            return v
        }
    }

    const formatExpiryDate = (value: string): string => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')

        if (v.length >= 2) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`
        }

        return v
    }

    const formatCVV = (value: string): string => {
        return value.replace(/[^0-9]/gi, '').substring(0, 4)
    }

    const formatZipCode = (value: string): string => {
        // Allow digits and hyphens only
        return value.replace(/[^0-9-]/g, '')
    }

    const formatPhoneNumber = (value: string): string => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')

        if (v.length >= 6) {
            return `(${v.substring(0, 3)}) ${v.substring(3, 6)}-${v.substring(6, 10)}`
        } else if (v.length >= 3) {
            return `(${v.substring(0, 3)}) ${v.substring(3)}`
        }

        return v
    }

    const getCardType = (cardNumber: string): string | null => {
        const number = cardNumber.replace(/\s/g, '')

        if (/^4/.test(number)) return 'visa'
        if (/^5[1-5]/.test(number)) return 'mastercard'
        if (/^2[2-7]/.test(number)) return 'mastercard'
        if (/^3[47]/.test(number)) return 'amex'
        if (/^6(?:011|5)/.test(number)) return 'discover'
        if (/^35(?:2[89]|[3-8][0-9])/.test(number)) return 'jcb'
        if (/^3(?:0[0-5]|[68][0-9])/.test(number)) return 'diners'

        return null
    }

    const getCardIcon = (cardType: string): string => {
        const baseUrl = 'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat'

        const icons: Record<string, string> = {
            visa: `${baseUrl}/visa.svg`,
            mastercard: `${baseUrl}/mastercard.svg`,
            amex: `${baseUrl}/amex.svg`,
            discover: `${baseUrl}/discover.svg`
        }

        return icons[cardType] || `${baseUrl}/generic.svg`
    }


    return {
        formatCardNumber,
        formatExpiryDate,
        formatCVV,
        formatZipCode,
        formatPhoneNumber,
        getCardType,
        getCardIcon
    }
}