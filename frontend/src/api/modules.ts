import apiClient from './axios';

// =============================================================================
// 1. RESTAURANT API
// =============================================================================
export interface RestaurantTable {
  id: number;
  tableNumber: string;
  name: string;
  capacity: number;
  sectionFloor: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  activeOrderId?: number;
  activeOrder?: RestaurantOrder;
  reservationCustomerName?: string;
  reservationCustomerPhone?: string;
  reservationNotes?: string;
  reservationTime?: string;
  createdAt: string;
}

export interface RestaurantOrderItem {
  id?: number;
  productId?: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  notes?: string;
  kotStatus?: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED';
}

export interface RestaurantOrder {
  id: number;
  tableId?: number;
  tableName?: string;
  orderNumber: string;
  orderType: 'DINE_IN' | 'TAKEAWAY';
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  status: 'ORDERED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  notes?: string;
  items: RestaurantOrderItem[];
  createdAt: string;
}

export interface RestaurantKotTicket {
  id: number;
  orderId: number;
  kotNumber: string;
  tableName: string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED';
  notes?: string;
  items: RestaurantOrderItem[];
  createdAt: string;
}

export const restaurantApi = {
  getTables: async (): Promise<RestaurantTable[]> => {
    const res = await apiClient.get('/restaurant/tables');
    return res.data.data;
  },
  createTable: async (payload: Partial<RestaurantTable>): Promise<RestaurantTable> => {
    const res = await apiClient.post('/restaurant/tables', payload);
    return res.data.data;
  },
  updateTable: async (id: number, payload: Partial<RestaurantTable>): Promise<RestaurantTable> => {
    const res = await apiClient.put(`/restaurant/tables/${id}`, payload);
    return res.data.data;
  },
  deleteTable: async (id: number): Promise<void> => {
    await apiClient.delete(`/restaurant/tables/${id}`);
  },
  reserveTable: async (
    tableId: number,
    payload: { customerName: string; customerPhone?: string; notes?: string; reservationTime?: string }
  ): Promise<RestaurantTable> => {
    const res = await apiClient.post(`/restaurant/tables/${tableId}/reserve`, payload);
    return res.data.data;
  },
  cancelReservation: async (tableId: number): Promise<RestaurantTable> => {
    const res = await apiClient.post(`/restaurant/tables/${tableId}/cancel-reservation`);
    return res.data.data;
  },
  getOrders: async (status?: string): Promise<RestaurantOrder[]> => {
    const res = await apiClient.get('/restaurant/orders', { params: { status } });
    return res.data.data;
  },
  createOrder: async (payload: {
    tableId?: number;
    orderType: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    customerAddress?: string;
    notes?: string;
    items: { productId?: number; itemName: string; quantity: number; unitPrice: number; notes?: string }[];
  }): Promise<RestaurantOrder> => {
    const res = await apiClient.post('/restaurant/orders', payload);
    return res.data.data;
  },
  updateOrderStatus: async (orderId: number, status: string): Promise<RestaurantOrder> => {
    const res = await apiClient.put(`/restaurant/orders/${orderId}/status`, { status });
    return res.data.data;
  },
  deleteOrder: async (orderId: number): Promise<void> => {
    await apiClient.delete(`/restaurant/orders/${orderId}`);
  },
  getKotTickets: async (): Promise<RestaurantKotTicket[]> => {
    const res = await apiClient.get('/restaurant/kot');
    return res.data.data;
  },
  updateKotStatus: async (kotId: number, status: string): Promise<RestaurantKotTicket> => {
    const res = await apiClient.put(`/restaurant/kot/${kotId}/status`, { status });
    return res.data.data;
  },
  deleteKotTicket: async (kotId: number): Promise<void> => {
    await apiClient.delete(`/restaurant/kot/${kotId}`);
  },
  settleTableBill: async (
    tableId: number,
    payload?: { paymentMethod?: string; amountPaid?: number; notes?: string; customerName?: string; customerPhone?: string; customerEmail?: string; customerAddress?: string }
  ): Promise<RestaurantTable> => {
    const res = await apiClient.post(`/restaurant/tables/${tableId}/settle-bill`, payload || {});
    return res.data.data;
  },
  settleOrder: async (
    orderId: number,
    payload?: { paymentMethod?: string; amountPaid?: number; notes?: string; customerName?: string; customerPhone?: string; customerEmail?: string; customerAddress?: string }
  ): Promise<RestaurantOrder> => {
    const res = await apiClient.post(`/restaurant/orders/${orderId}/settle`, payload || {});
    return res.data.data;
  },
};

// =============================================================================
// 2. SALON API
// =============================================================================
export interface SalonServiceItem {
  id: number;
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface SalonAppointment {
  id: number;
  customerId?: number;
  customerName: string;
  customerPhone?: string;
  serviceId?: number;
  serviceName: string;
  staffName?: string;
  appointmentDate: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  price: number;
  status: 'BOOKED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  createdAt: string;
}

export interface CustomerServiceHistory {
  customerName: string;
  customerPhone: string;
  totalAppointments: number;
  totalSpent: number;
  pastAppointments: SalonAppointment[];
}

export const salonApi = {
  getServices: async (): Promise<SalonServiceItem[]> => {
    const res = await apiClient.get('/salon/services');
    return res.data.data;
  },
  createService: async (payload: Partial<SalonServiceItem>): Promise<SalonServiceItem> => {
    const res = await apiClient.post('/salon/services', payload);
    return res.data.data;
  },
  updateService: async (id: number, payload: Partial<SalonServiceItem>): Promise<SalonServiceItem> => {
    const res = await apiClient.put(`/salon/services/${id}`, payload);
    return res.data.data;
  },
  deleteService: async (id: number): Promise<void> => {
    await apiClient.delete(`/salon/services/${id}`);
  },
  getAppointments: async (params?: { date?: string; startDate?: string; endDate?: string }): Promise<SalonAppointment[]> => {
    const res = await apiClient.get('/salon/appointments', { params });
    return res.data.data;
  },
  createAppointment: async (payload: Partial<SalonAppointment>): Promise<SalonAppointment> => {
    const res = await apiClient.post('/salon/appointments', payload);
    return res.data.data;
  },
  updateStatus: async (id: number, status: string): Promise<SalonAppointment> => {
    const res = await apiClient.put(`/salon/appointments/${id}/status`, { status });
    return res.data.data;
  },
  getCustomerHistory: async (phone: string): Promise<CustomerServiceHistory> => {
    const res = await apiClient.get('/salon/customer-history', { params: { phone } });
    return res.data.data;
  },
};

// =============================================================================
// 3. ELECTRONICS API
// =============================================================================
export interface DeviceSerialItem {
  id: number;
  productId?: number;
  productName: string;
  brand?: string;
  model?: string;
  serialNumber: string;
  imeiNumber?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  invoiceNumber?: string;
  purchaseDate: string;
  warrantyMonths: number;
  warrantyStartDate: string;
  warrantyExpiryDate: string;
  warrantyStatus: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'VOID';
  daysRemaining: number;
  warrantyProvider?: string;
  notes?: string;
  createdAt: string;
}

export interface WarrantyLookupResult {
  found: boolean;
  device?: DeviceSerialItem;
  message?: string;
}

export const electronicsApi = {
  getDevices: async (search?: string): Promise<DeviceSerialItem[]> => {
    const res = await apiClient.get('/electronics/devices', { params: { search } });
    return res.data.data;
  },
  registerDevice: async (payload: Partial<DeviceSerialItem>): Promise<DeviceSerialItem> => {
    const res = await apiClient.post('/electronics/devices', payload);
    return res.data.data;
  },
  lookupWarranty: async (query: string): Promise<WarrantyLookupResult> => {
    const res = await apiClient.get('/electronics/warranty-lookup', { params: { query } });
    return res.data.data;
  },
  deleteDevice: async (id: number): Promise<void> => {
    await apiClient.delete(`/electronics/devices/${id}`);
  },
};

// =============================================================================
// 4. REPAIR & SERVICE API
// =============================================================================
export interface RepairJobCard {
  id: number;
  jobCardNumber: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  itemType: string;
  brand?: string;
  model?: string;
  serialOrImei?: string;
  problemDescription: string;
  diagnosticNotes?: string;
  workPerformed?: string;
  partsCost: number;
  labourCost: number;
  totalEstimatedCost: number;
  totalFinalCost: number;
  assignedTechnician?: string;
  status: 'RECEIVED' | 'DIAGNOSING' | 'REPAIRING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  estimatedCompletionDate?: string;
  deliveryDate?: string;
  paymentStatus: 'PENDING' | 'PAID';
  createdAt: string;
  updatedAt?: string;
}

export const repairApi = {
  getJobCards: async (params?: { search?: string; status?: string }): Promise<RepairJobCard[]> => {
    const res = await apiClient.get('/repairs/job-cards', { params });
    return res.data.data;
  },
  createJobCard: async (payload: Partial<RepairJobCard>): Promise<RepairJobCard> => {
    const res = await apiClient.post('/repairs/job-cards', payload);
    return res.data.data;
  },
  updateJobCard: async (id: number, payload: Partial<RepairJobCard>): Promise<RepairJobCard> => {
    const res = await apiClient.put(`/repairs/job-cards/${id}`, payload);
    return res.data.data;
  },
  getCustomerRepairHistory: async (phone: string): Promise<RepairJobCard[]> => {
    const res = await apiClient.get('/repairs/customer-history', { params: { phone } });
    return res.data.data;
  },
  deleteJobCard: async (id: number): Promise<void> => {
    await apiClient.delete(`/repairs/job-cards/${id}`);
  },
};

// =============================================================================
// 5. EDUCATION & COACHING API
// =============================================================================
export interface EduCourse {
  id: number;
  name: string;
  code?: string;
  duration: string;
  totalFees: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface EduBatch {
  id: number;
  courseId: number;
  courseName?: string;
  batchName: string;
  schedule?: string;
  startDate?: string;
  endDate?: string;
  capacity: number;
  enrolledCount?: number;
  isActive: boolean;
  createdAt: string;
}

export interface EduStudent {
  id: number;
  fullName: string;
  studentIdNumber: string;
  email?: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  admissionDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'DROPPED';
  currentBatchId?: number;
  currentBatchName?: string;
  createdAt: string;
}

export interface EduEnrollment {
  id: number;
  studentId: number;
  studentName: string;
  studentPhone: string;
  batchId: number;
  batchName: string;
  courseId: number;
  courseName: string;
  enrollmentDate: string;
  totalFees: number;
  discount: number;
  netFees: number;
  paidAmount: number;
  pendingAmount: number;
  nextDueDate?: string;
  paymentStatus: 'PAID' | 'PARTIAL' | 'OVERDUE' | 'PENDING';
  createdAt: string;
}

export interface EduFeePayment {
  id: number;
  enrollmentId: number;
  studentId: number;
  studentName: string;
  receiptNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
}

export interface EduAttendance {
  id: number;
  batchId: number;
  studentId: number;
  studentName: string;
  attendanceDate: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
}

export interface EduExamResult {
  id: number;
  batchId: number;
  studentId: number;
  studentName: string;
  examName: string;
  subject: string;
  examDate: string;
  maxMarks: number;
  marksObtained: number;
  grade?: string;
  remarks?: string;
}

export interface EduSummary {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  totalBatches: number;
  activeBatches: number;
  totalCourses: number;
  totalCollectedFees: number;
  totalPendingFees: number;
  overdueCount: number;
  recentAdmissions: EduStudent[];
  pendingDues: EduEnrollment[];
  recentPayments: EduFeePayment[];
}

export const educationApi = {
  getCourses: async (): Promise<EduCourse[]> => {
    const res = await apiClient.get('/education/courses');
    return res.data.data;
  },
  createCourse: async (payload: Partial<EduCourse>): Promise<EduCourse> => {
    const res = await apiClient.post('/education/courses', payload);
    return res.data.data;
  },
  updateCourse: async (id: number, payload: Partial<EduCourse>): Promise<EduCourse> => {
    const res = await apiClient.put(`/education/courses/${id}`, payload);
    return res.data.data;
  },
  deleteCourse: async (id: number): Promise<void> => {
    await apiClient.delete(`/education/courses/${id}`);
  },
  getBatches: async (): Promise<EduBatch[]> => {
    const res = await apiClient.get('/education/batches');
    return res.data.data;
  },
  createBatch: async (payload: Partial<EduBatch>): Promise<EduBatch> => {
    const res = await apiClient.post('/education/batches', payload);
    return res.data.data;
  },
  updateBatch: async (id: number, payload: Partial<EduBatch>): Promise<EduBatch> => {
    const res = await apiClient.put(`/education/batches/${id}`, payload);
    return res.data.data;
  },
  deleteBatch: async (id: number): Promise<void> => {
    await apiClient.delete(`/education/batches/${id}`);
  },
  getStudents: async (search?: string): Promise<EduStudent[]> => {
    const res = await apiClient.get('/education/students', { params: { search } });
    return res.data.data;
  },
  createStudent: async (payload: Partial<EduStudent>): Promise<EduStudent> => {
    const res = await apiClient.post('/education/students', payload);
    return res.data.data;
  },
  updateStudent: async (id: number, payload: Partial<EduStudent>): Promise<EduStudent> => {
    const res = await apiClient.put(`/education/students/${id}`, payload);
    return res.data.data;
  },
  deleteStudent: async (id: number): Promise<void> => {
    await apiClient.delete(`/education/students/${id}`);
  },
  getSummary: async (): Promise<EduSummary> => {
    const res = await apiClient.get('/education/summary');
    return res.data.data;
  },
  getEnrollments: async (paymentStatus?: string): Promise<EduEnrollment[]> => {
    const res = await apiClient.get('/education/enrollments', { params: { paymentStatus } });
    return res.data.data;
  },
  recordFeePayment: async (payload: {
    enrollmentId: number;
    amount: number;
    paymentMethod: string;
    paymentDate?: string;
    notes?: string;
    nextDueDate?: string;
  }): Promise<EduEnrollment> => {
    const res = await apiClient.post('/education/fees/pay', payload);
    return res.data.data;
  },
  getFeePayments: async (): Promise<EduFeePayment[]> => {
    const res = await apiClient.get('/education/fees/payments');
    return res.data.data;
  },
  getAttendance: async (batchId: number, date?: string): Promise<EduAttendance[]> => {
    const res = await apiClient.get('/education/attendance', { params: { batchId, date } });
    return res.data.data;
  },
  markAttendance: async (payload: {
    batchId: number;
    attendanceDate: string;
    attendances: { studentId: number; status: string; remarks?: string }[];
  }): Promise<EduAttendance[]> => {
    const res = await apiClient.post('/education/attendance', payload);
    return res.data.data;
  },
  getExamResults: async (batchId: number): Promise<EduExamResult[]> => {
    const res = await apiClient.get('/education/exams', { params: { batchId } });
    return res.data.data;
  },
  recordExamResult: async (payload: Partial<EduExamResult>): Promise<EduExamResult> => {
    const res = await apiClient.post('/education/exams', payload);
    return res.data.data;
  },
};

