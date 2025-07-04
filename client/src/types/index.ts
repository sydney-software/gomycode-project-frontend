export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  maxQuantity: number;
}

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: 'cod' | 'mpesa' | 'card';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}
