import { Product } from "./products";


export interface Cart {
  id: number;
  user_id: number;
  quantity: number;
  product_id:number;
  product: Product;
}
