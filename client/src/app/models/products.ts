export interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    brand: string;
    rating: number;
    stock: number;
    images: string[];
    specs?: Record<string, string | boolean>;
}

export interface ProductResponse {
    data: Product[];
    total: number;
}

export type CreateProduct = Omit<Product, 'id'>;
