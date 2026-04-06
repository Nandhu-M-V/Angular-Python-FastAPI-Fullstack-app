export interface CreateReview {
    product_id: number;
    user_id?: number;
    rating: number;
    comment: string;
}

export interface Review {
  id: number;
  comment: string;
  rating: number;
  product_id: number;
  user_id: number;
  username: string;
  date: string;
}
