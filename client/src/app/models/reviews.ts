export interface Review {
    id?: string;
    productId: string;
    userId?: number;
    rating?: number;
    comment?: string;
    date: string;
}
