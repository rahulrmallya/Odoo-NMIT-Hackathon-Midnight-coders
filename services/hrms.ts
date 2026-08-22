import { apiRequest } from '@/services/api-client'
import type { Attendance, Employee, EmployeeInput, Salary, TimeOffInput, TimeOffRequest } from '@/services/types'

export const hrms = {
  employees: () => apiRequest<Employee[]>('/employees'),
  employee: (id: string) => apiRequest<Employee>(`/employees/${id}`),
  profile: (id: string) => apiRequest<Employee>(`/employees/${id}/profile`),
  createEmployee: (input: EmployeeInput) => apiRequest<Employee>('/employees', { method: 'POST', body: JSON.stringify(input) }),
  updateEmployee: (id: string, input: Partial<EmployeeInput>) => apiRequest<Employee>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  updateProfile: (id: string, input: Partial<EmployeeInput>) => apiRequest<Employee>(`/employees/${id}/profile`, { method: 'PUT', body: JSON.stringify(input) }),
  deleteEmployee: (id: string) => apiRequest<void>(`/employees/${id}`, { method: 'DELETE' }),
  attendance: () => apiRequest<Attendance[]>('/attendance'),
  employeeAttendance: (id: string) => apiRequest<Attendance[]>(`/attendance/${id}`),
  checkIn: () => apiRequest<Attendance>('/attendance/check-in', { method: 'POST' }),
  checkOut: () => apiRequest<Attendance>('/attendance/check-out', { method: 'POST' }),
  timeOff: () => apiRequest<TimeOffRequest[]>('/time-off'),
  createTimeOff: (input: TimeOffInput) => apiRequest<TimeOffRequest>('/time-off', { method: 'POST', body: JSON.stringify(input) }),
  approveTimeOff: (id: string, admin_comment?: string) => apiRequest<TimeOffRequest>(`/time-off/${id}/approve`, { method: 'PATCH', body: JSON.stringify({ admin_comment }) }),
  rejectTimeOff: (id: string, admin_comment?: string) => apiRequest<TimeOffRequest>(`/time-off/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ admin_comment }) }),
  salary: (id: string) => apiRequest<Salary>(`/employees/${id}/salary`),
  updateSalary: (id: string, input: Partial<Salary>) => apiRequest<Salary>(`/employees/${id}/salary`, { method: 'PUT', body: JSON.stringify(input) }),
}
