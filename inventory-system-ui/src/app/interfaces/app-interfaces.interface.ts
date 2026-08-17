export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  price: number;
  stock: number;
}

export interface Transaction {
  id?: string;
  createdDate?: Date;
  transactionType: string;
  productId: number;
  amount: number;
  unitPrice: number;
  totalPrice: number;
  detail: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNExt: boolean;
}
