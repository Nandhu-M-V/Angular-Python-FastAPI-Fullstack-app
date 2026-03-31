export interface WishlistItem {
    id: string;
    userId: number;
    productId: string; // ⚠️ string because your products use string IDs
}
