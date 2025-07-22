import type { Product, Category, FilterState } from '~/types'

export const useProductsFilters = () => {
    // State
    const state = reactive({
        products: [] as Product[],
        categories: [] as Category[],
        loading: false,
        error: null as string | null,
        searchQuery: '',
        sortBy: '',
        viewMode: 'grid' as 'grid' | 'list',
        currentPage: 1,
        itemsPerPage: 12,
        filters: {
            selectedCategory: '',
            minPrice: 0,
            maxPrice: 2000,
            selectedBrands: [],
            minRating: 0
        } as FilterState
    })

    // Computed
    const availableBrands = computed(() => {
        const brands = new Set(
            state.products
                .map(product => product.brand)
                .filter(brand => brand && brand.trim() !== '')
        )
        return Array.from(brands).sort()
    })

    const priceRange = computed(() => {
        if (state.products.length === 0) return { min: 0, max: 2000 }

        const prices = state.products.map(product =>
            product.price - (product.price * product.discountPercentage / 100)
        )
        return {
            min: Math.floor(Math.min(...prices)),
            max: Math.ceil(Math.max(...prices))
        }
    })

    const validatedPriceFilters = computed(() => {
        const { minPrice, maxPrice } = state.filters
        const { min: absoluteMin, max: absoluteMax } = priceRange.value

        // Ensure min/max are within absolute bounds
        const validMin = Math.max(Math.min(minPrice, absoluteMax), absoluteMin)
        const validMax = Math.min(Math.max(maxPrice, absoluteMin), absoluteMax)

        // Ensure min <= max (swap if needed)
        if (validMin > validMax) {
            return {
                minPrice: validMax,
                maxPrice: validMin
            }
        }

        return {
            minPrice: validMin,
            maxPrice: validMax
        }
    })


    const filteredProducts = computed(() => {
        let filtered = [...state.products]

        // Use validated price filters
        const { minPrice, maxPrice } = validatedPriceFilters.value

        // Price filter - only apply if different from default range
        if (minPrice > priceRange.value.min || maxPrice < priceRange.value.max) {
            filtered = filtered.filter(product => {
                const price = product.price - (product.price * product.discountPercentage / 100)
                return price >= minPrice && price <= maxPrice
            })
        }

        // Brand filter
        if (state.filters.selectedBrands.length > 0) {
            filtered = filtered.filter(product =>
                state.filters.selectedBrands.includes(product.brand)
            )
        }

        // Rating filter
        if (state.filters.minRating > 0) {
            filtered = filtered.filter(product => product.rating >= state.filters.minRating)
        }

        return filtered
    })

    const sortedProducts = computed(() => {
        if (!state.sortBy) return filteredProducts.value

        const sorted = [...filteredProducts.value]

        switch (state.sortBy) {
            case 'price-low':
                return sorted.sort((a, b) => a.price - b.price)
            case 'price-high':
                return sorted.sort((a, b) => b.price - a.price)
            case 'rating':
                return sorted.sort((a, b) => b.rating - a.rating)
            case 'name':
                return sorted.sort((a, b) => a.title.localeCompare(b.title))
            default:
                return sorted
        }
    })

    const totalPages = computed(() => Math.ceil(sortedProducts.value.length / state.itemsPerPage))

    const paginatedProducts = computed(() => {
        const start = (state.currentPage - 1) * state.itemsPerPage
        const end = start + state.itemsPerPage
        return sortedProducts.value.slice(start, end)
    })

    const validatePriceRange = (min: number, max: number) => {
        const { min: absoluteMin, max: absoluteMax } = priceRange.value

        // Clamp values to absolute bounds
        const clampedMin = Math.max(Math.min(min, absoluteMax), absoluteMin)
        const clampedMax = Math.min(Math.max(max, absoluteMin), absoluteMax)

        // Ensure min <= max
        if (clampedMin > clampedMax) {
            return {
                minPrice: clampedMax,
                maxPrice: clampedMin,
                swapped: true
            }
        }

        return {
            minPrice: clampedMin,
            maxPrice: clampedMax,
            swapped: false
        }
    }

    const updatePriceRange = (min: number, max: number) => {
        const validated = validatePriceRange(min, max)

        state.filters.minPrice = validated.minPrice
        state.filters.maxPrice = validated.maxPrice

        if (validated.swapped) {
            console.warn('Price range corrected: min and max values were swapped')
        }

        return validated
    }

    return {
        // State
        state,
        // Computed
        availableBrands,
        priceRange,
        validatedPriceFilters,
        filteredProducts,
        sortedProducts,
        totalPages,
        paginatedProducts,
        validatePriceRange,
        updatePriceRange
    }
}