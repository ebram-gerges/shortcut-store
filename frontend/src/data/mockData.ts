export interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  colors: string[];
  sizes: string[];
  category: string;
  inStock: boolean;
  stock: number;
}

export const mockProducts: Product[] = [
  {
    id: 1,
    name: 'tshirt',
    price: 99.99,
    rating: 4.5,
    colors: ['black', 'white'],
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'tshirts',
    inStock: true,
    stock: 10,
  },
  {
    id: 2,
    name: 'pantas (Black)',
    price: 30.00,
    rating: 5.0,
    colors: ['black', 'white'],
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'bottoms',
    inStock: true,
    stock: 27,
  },
  {
    id: 3,
    name: 'Graphic Tee',
    price: 45.00,
    rating: 4.2,
    colors: ['black', 'white'],
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'tshirts',
    inStock: true,
    stock: 14,
  },
  {
    id: 4,
    name: 'Basic Tee',
    price: 25.00,
    rating: 4.0,
    colors: ['black', 'white'],
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'tshirts',
    inStock: false,
    stock: 0,
  },
  {
    id: 5,
    name: 'Summer Shorts',
    price: 35.00,
    rating: 4.3,
    colors: ['black', 'white'],
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'bottoms',
    inStock: true,
    stock: 30,
  },
  {
    id: 6,
    name: 'Casual Set',
    price: 75.00,
    rating: 4.7,
    colors: ['black', 'white'],
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'sets',
    inStock: true,
    stock: 40,
  },
];