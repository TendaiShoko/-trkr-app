// Open Food Facts API - Free, no API key needed
const BASE_URL = 'https://world.openfoodfacts.org'

export async function searchFood(query, page = 1) {
  try {
    const response = await fetch(
      `${BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=${page}&page_size=20`
    )
    
    if (!response.ok) throw new Error('Search failed')
    
    const data = await response.json()
    
    return data.products.map((product) => ({
      id: product.code,
      name: product.product_name || 'Unknown',
      brand: product.brands || '',
      calories: Math.round(product.nutriments?.['energy-kcal_100g'] || 0),
      protein: Math.round(product.nutriments?.proteins_100g || 0),
      carbs: Math.round(product.nutriments?.carbohydrates_100g || 0),
      fat: Math.round(product.nutriments?.fat_100g || 0),
      serving_size: product.serving_size || '100g',
      image: product.image_small_url || null,
    }))
  } catch (error) {
    console.error('Food search error:', error)
    return []
  }
}

export async function getFoodByBarcode(barcode) {
  try {
    const response = await fetch(`${BASE_URL}/api/v0/product/${barcode}.json`)
    
    if (!response.ok) throw new Error('Product not found')
    
    const data = await response.json()
    
    if (data.status !== 1) return null
    
    const product = data.product
    return {
      id: product.code,
      name: product.product_name || 'Unknown',
      brand: product.brands || '',
      calories: Math.round(product.nutriments?.['energy-kcal_100g'] || 0),
      protein: Math.round(product.nutriments?.proteins_100g || 0),
      carbs: Math.round(product.nutriments?.carbohydrates_100g || 0),
      fat: Math.round(product.nutriments?.fat_100g || 0),
      serving_size: product.serving_size || '100g',
      image: product.image_small_url || null,
    }
  } catch (error) {
    console.error('Barcode lookup error:', error)
    return null
  }
}
