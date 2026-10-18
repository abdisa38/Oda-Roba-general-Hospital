// ORHIMS API Client
// Connects frontend to Express + MongoDB Atlas backend

const envBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
const API_BASE = envBase
  ? (envBase.endsWith('/api') ? envBase : `${envBase}/api`)
  : '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `Request failed with status ${res.status}` }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
}

// -------------------------------------------------------------
// PATIENTS
// -------------------------------------------------------------
export interface ApiPatient {
  id: string;
  name: string;
  amharicName?: string;
  gender: string;
  birth: string;
  dob?: string;
  age?: number;
  bloodGroup?: string;
  contact: string;
  phoneToken?: string;
  residence: string;
  registered: string;
  emergencyName?: string;
  emergencyPhone?: string;
  relationship?: string;
  allergies?: string[];
  chronicConditions?: string[];
}

export const api = {
  // Patients
  getPatients: (params?: { q?: string; scope?: string; sort?: string; order?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<ApiPatient[]>(`/patients${query ? `?${query}` : ''}`);
  },
  getPatient: (id: string) => request<ApiPatient>(`/patients/${encodeURIComponent(id)}`),
  createPatient: (data: Partial<ApiPatient>) => request<ApiPatient>('/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updatePatient: (id: string, data: Partial<ApiPatient>) => request<ApiPatient>(`/patients/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deletePatient: (id: string) => request<{ message: string; id: string }>(`/patients/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }),

  // Staff Users
  getStaff: () => request<any[]>('/staff'),
  createStaff: (data: any) => request<any>('/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateStaff: (id: string, data: any) => request<any>(`/staff/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteStaff: (id: string) => request<any>(`/staff/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }),
  loginStaff: (credentials: { username?: string; password?: string; roleId?: string }) => request<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  // Appointments
  getAppointments: (params?: { patientId?: string; doctorId?: string; status?: string; date?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any[]>(`/appointments${query ? `?${query}` : ''}`);
  },
  createAppointment: (data: any) => request<any>('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateAppointment: (id: string, data: any) => request<any>(`/appointments/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteAppointment: (id: string) => request<any>(`/appointments/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }),

  // Queue
  getQueue: () => request<any[]>('/queue'),
  createQueueTicket: (data: any) => request<any>('/queue', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateQueueTicket: (id: string, data: any) => request<any>(`/queue/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteQueueTicket: (id: string) => request<any>(`/queue/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }),

  // Clinical Encounters
  getClinicalRecords: (patientId?: string) => {
    const q = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
    return request<any[]>(`/clinical${q}`);
  },
  createClinicalRecord: (data: any) => request<any>('/clinical', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateClinicalRecord: (id: string, data: any) => request<any>(`/clinical/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Diagnoses
  getDiagnoses: (patientId?: string) => {
    const q = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
    return request<any[]>(`/diagnoses${q}`);
  },
  createDiagnosis: (data: any) => request<any>('/diagnoses', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateDiagnosis: (id: string, data: any) => request<any>(`/diagnoses/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteDiagnosis: (id: string) => request<any>(`/diagnoses/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }),

  // Prescriptions
  getPrescriptions: (params?: { patientId?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any[]>(`/prescriptions${query ? `?${query}` : ''}`);
  },
  createPrescription: (data: any) => request<any>('/prescriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updatePrescription: (id: string, data: any) => request<any>(`/prescriptions/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deletePrescription: (id: string) => request<any>(`/prescriptions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }),

  // Lab Orders
  getLabOrders: (params?: { patientId?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any[]>(`/lab${query ? `?${query}` : ''}`);
  },
  createLabOrder: (data: any) => request<any>('/lab', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateLabOrder: (id: string, data: any) => request<any>(`/lab/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteLabOrder: (id: string) => request<any>(`/lab/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }),

  // Inventory
  getInventory: (params?: { search?: string; category?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any[]>(`/inventory${query ? `?${query}` : ''}`);
  },
  createInventoryItem: (data: any) => request<any>('/inventory', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateInventoryItem: (id: string, data: any) => request<any>(`/inventory/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteInventoryItem: (id: string) => request<any>(`/inventory/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }),

  // Billing
  getBilling: (params?: { patientId?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any[]>(`/billing${query ? `?${query}` : ''}`);
  },
  createInvoice: (data: any) => request<any>('/billing', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateInvoice: (id: string, data: any) => request<any>(`/billing/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Inpatient
  getInpatientBeds: (params?: { ward?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any[]>(`/inpatient${query ? `?${query}` : ''}`);
  },
  updateInpatientBed: (bedId: string, data: any) => request<any>(`/inpatient/${encodeURIComponent(bedId)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};
