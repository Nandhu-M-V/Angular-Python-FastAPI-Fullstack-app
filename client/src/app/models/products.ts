export interface Product {
    id: string;
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


export type CreateProduct = Omit<Product, 'id'>;
