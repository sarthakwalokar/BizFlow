import apiClient from './axios';
import { ApiResponse, PageResponse } from './health';
import { ProductType } from './products';

export type MovementType = 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN';
export type PurchaseStatus = 'ORDERED' | 'RECEIVED' | 'CANCELLED';
export type ReferenceType = 'ORDER' | 'PURCHASE' | 'MANUAL_ADJUSTMENT' | 'TRANSFER';

export interface LocationStockItem {
  locationId: number;
  locationName: string;
  locationCode?: string;
  quantity: number;
  lowStockThreshold: number;
}

export interface StockItem {
  productId: number;
  productName: string;
  sku?: string;
  categoryName?: string;
  productType: ProductType;
  price: number;
  costPrice?: number;
  trackStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  lowStock: boolean;
  outOfStock: boolean;
  locationStocks?: LocationStockItem[];
}

export interface StockAdjustRequest {
  productId: number;
  locationId?: number;
  adjustmentQuantity?: number;
  newStockQuantity?: number;
  notes?: string;
}

export interface StockTransferRequest {
  productId: number;
  sourceLocationId: number;
  targetLocationId: number;
  quantity: number;
  notes?: string;
}

export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  productSku?: string;
  locationId?: number;
  locationName?: string;
  movementType: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType: ReferenceType;
  referenceId?: number;
  referenceNumber?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

export interface InventorySummary {
  businessSize: 'SMALL' | 'LARGE';
  inventoryEnabled: boolean;
  totalTrackedProducts: number;
  inStockProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalInventoryValuation: number;
  totalRetailValuation: number;
  totalLocationsCount: number;
  totalSuppliersCount: number;
  totalPurchasesCount: number;
  totalPurchaseSpend: number;
  currency: string;
  recentMovements: StockMovement[];
}

export interface Location {
  id: number;
  businessId: number;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  primary: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocationRequest {
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  primary?: boolean;
  active?: boolean;
}

export interface Supplier {
  id: number;
  businessId: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierRequest {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  active?: boolean;
}

export interface PurchaseItem {
  id: number;
  productId?: number;
  productNameSnapshot: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseItemRequest {
  productId?: number;
  productName: string;
  quantity: number;
  unitCost: number;
}

export interface Purchase {
  id: number;
  businessId: number;
  supplierId?: number;
  supplierName?: string;
  locationId?: number;
  locationName?: string;
  purchaseNumber: string;
  status: PurchaseStatus;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  purchaseDate: string;
  notes?: string;
  createdBy?: string;
  createdByUserId?: number;
  items: PurchaseItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRequest {
  supplierId?: number;
  locationId?: number;
  purchaseDate: string;
  status?: PurchaseStatus;
  paymentStatus?: string;
  paymentMethod?: string;
  notes?: string;
  items: PurchaseItemRequest[];
}

export const inventoryApi = {
  getSummary: async (): Promise<InventorySummary> => {
    const res = await apiClient.get<ApiResponse<InventorySummary>>('/inventory/summary');
    return res.data.data;
  },

  getStockList: async (params?: {
    search?: string;
    categoryId?: number;
    lowStockOnly?: boolean;
    page?: number;
    size?: number;
  }): Promise<PageResponse<StockItem>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<StockItem>>>('/inventory/stock', {
      params,
    });
    return res.data.data;
  },

  adjustStock: async (data: StockAdjustRequest): Promise<StockItem> => {
    const res = await apiClient.post<ApiResponse<StockItem>>('/inventory/adjust', data);
    return res.data.data;
  },

  transferStock: async (data: StockTransferRequest): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/inventory/transfer', data);
  },

  getMovements: async (params?: {
    productId?: number;
    locationId?: number;
    movementType?: MovementType;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<StockMovement>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<StockMovement>>>('/inventory/movements', {
      params,
    });
    return res.data.data;
  },

  // Locations
  getLocations: async (activeOnly = false): Promise<Location[]> => {
    const res = await apiClient.get<ApiResponse<Location[]>>('/inventory/locations', {
      params: { activeOnly },
    });
    return res.data.data;
  },

  createLocation: async (data: LocationRequest): Promise<Location> => {
    const res = await apiClient.post<ApiResponse<Location>>('/inventory/locations', data);
    return res.data.data;
  },

  updateLocation: async (id: number, data: LocationRequest): Promise<Location> => {
    const res = await apiClient.put<ApiResponse<Location>>(`/inventory/locations/${id}`, data);
    return res.data.data;
  },

  deleteLocation: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/inventory/locations/${id}`);
  },

  // Suppliers
  getActiveSuppliers: async (): Promise<Supplier[]> => {
    const res = await apiClient.get<ApiResponse<Supplier[]>>('/inventory/suppliers/active');
    return res.data.data;
  },

  searchSuppliers: async (params?: {
    search?: string;
    active?: boolean;
    page?: number;
    size?: number;
  }): Promise<PageResponse<Supplier>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Supplier>>>('/inventory/suppliers', {
      params,
    });
    return res.data.data;
  },

  createSupplier: async (data: SupplierRequest): Promise<Supplier> => {
    const res = await apiClient.post<ApiResponse<Supplier>>('/inventory/suppliers', data);
    return res.data.data;
  },

  updateSupplier: async (id: number, data: SupplierRequest): Promise<Supplier> => {
    const res = await apiClient.put<ApiResponse<Supplier>>(`/inventory/suppliers/${id}`, data);
    return res.data.data;
  },

  deleteSupplier: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/inventory/suppliers/${id}`);
  },

  // Purchases
  searchPurchases: async (params?: {
    status?: PurchaseStatus;
    supplierId?: number;
    locationId?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<Purchase>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Purchase>>>('/inventory/purchases', {
      params,
    });
    return res.data.data;
  },

  getPurchaseById: async (id: number): Promise<Purchase> => {
    const res = await apiClient.get<ApiResponse<Purchase>>(`/inventory/purchases/${id}`);
    return res.data.data;
  },

  createPurchase: async (data: PurchaseRequest): Promise<Purchase> => {
    const res = await apiClient.post<ApiResponse<Purchase>>('/inventory/purchases', data);
    return res.data.data;
  },

  markPurchaseReceived: async (id: number): Promise<Purchase> => {
    const res = await apiClient.post<ApiResponse<Purchase>>(`/inventory/purchases/${id}/receive`);
    return res.data.data;
  },

  cancelPurchase: async (id: number, reason?: string): Promise<Purchase> => {
    const res = await apiClient.post<ApiResponse<Purchase>>(`/inventory/purchases/${id}/cancel`, null, {
      params: { reason },
    });
    return res.data.data;
  },
};
