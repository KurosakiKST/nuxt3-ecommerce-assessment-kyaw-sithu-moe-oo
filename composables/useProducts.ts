import type { Product, ProductsResponse, FilterParams, Category } from '~/types'

export const useProducts = () => {
  const api = useApi()

  const getAllProducts = async (params?: FilterParams) => {
    return await api.get<ProductsResponse>('/products', params)
  }

  const getProduct = async (id: number) => {
    return await api.get<Product>(`/products/${id}`)
  }

  const getProductsByCategory = async (category: string, params?: FilterParams) => {
    return await api.get<ProductsResponse>(`/products/category/${category}`, params)
  }

  const searchProducts = async (query: string, params?: FilterParams) => {
    return await api.get<ProductsResponse>('/products/search', { q: query, ...params })
  }

  const getCategories = async () => {
    return await api.get<Category[]>('/products/categories')
  }

  const getFeaturedProducts = async (limit: number = 8) => {
    // Get products with high ratings as featured
    const response = await api.get<ProductsResponse>('/products', { limit, sortBy: 'rating', order: 'desc' })
    return response.products
  }

  return {
    getAllProducts,
    getProduct,
    getProductsByCategory,
    searchProducts,
    getCategories,
    getFeaturedProducts
  }
}