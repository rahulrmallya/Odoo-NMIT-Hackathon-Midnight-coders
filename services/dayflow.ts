export type Role = 'ADMIN' | 'EMPLOYEE'
export type AttendanceStatus = 'Checked In' | 'Checked Out' | 'Absent'
export type TimeOffStatus = 'Pending' | 'Approved' | 'Rejected'
export type TimeOffType = 'Paid' | 'Sick' | 'Unpaid'

export type Employee = { id: string; name: string; email: string; mobile: string; department: string; job: string; company: string; manager: string; location: string; status: AttendanceStatus; initials: string; joined: string }
export type Attendance = { id: string; employeeId: string; date: string; checkIn: string; checkOut: string; workHours: string; extraHours: string; status: AttendanceStatus }
export type TimeOffRequest = { id: string; employeeId: string; type: TimeOffType; from: string; to: string; days: number; reason: string; status: TimeOffStatus }
export type Salary = { employeeId: string; annual: string; monthly: string; currency: string; paySchedule: string }

export const employees: Employee[] = [
  { id: 'DF-1001', name: 'Olivia Martin', email: 'olivia.martin@dayflow.co', mobile: '+1 (415) 555-0142', department: 'People Operations', job: 'HR Manager', company: 'Dayflow Inc.', manager: 'Nora Wilson', location: 'San Francisco, CA', status: 'Checked In', initials: 'OM', joined: 'March 12, 2022' },
  { id: 'DF-1002', name: 'Liam Chen', email: 'liam.chen@dayflow.co', mobile: '+1 (415) 555-0188', department: 'Engineering', job: 'Senior Software Engineer', company: 'Dayflow Inc.', manager: 'Marcus Lee', location: 'Austin, TX', status: 'Checked In', initials: 'LC', joined: 'July 8, 2021' },
  { id: 'DF-1003', name: 'Sophia Williams', email: 'sophia.williams@dayflow.co', mobile: '+1 (415) 555-0114', department: 'Design', job: 'Product Designer', company: 'Dayflow Inc.', manager: 'Liam Chen', location: 'New York, NY', status: 'Checked Out', initials: 'SW', joined: 'January 20, 2023' },
  { id: 'DF-1004', name: 'Noah Patel', email: 'noah.patel@dayflow.co', mobile: '+1 (415) 555-0169', department: 'Finance', job: 'Financial Analyst', company: 'Dayflow Inc.', manager: 'Nora Wilson', location: 'Chicago, IL', status: 'Absent', initials: 'NP', joined: 'September 2, 2023' },
  { id: 'DF-1005', name: 'Emma Garcia', email: 'emma.garcia@dayflow.co', mobile: '+1 (415) 555-0193', department: 'Marketing', job: 'Content Strategist', company: 'Dayflow Inc.', manager: 'Nora Wilson', location: 'Miami, FL', status: 'Checked In', initials: 'EG', joined: 'February 14, 2024' },
  { id: 'DF-1006', name: 'James Wilson', email: 'james.wilson@dayflow.co', mobile: '+1 (415) 555-0126', department: 'Sales', job: 'Account Executive', company: 'Dayflow Inc.', manager: 'Nora Wilson', location: 'Denver, CO', status: 'Checked Out', initials: 'JW', joined: 'November 11, 2022' },
]

export const attendance: Attendance[] = employees.map((e, i) => ({ id: `ATT-${i + 1}`, employeeId: e.id, date: 'Aug 22, 2026', checkIn: e.status === 'Absent' ? '—' : i % 2 ? '08:47 AM' : '08:58 AM', checkOut: e.status === 'Checked Out' ? '05:12 PM' : '—', workHours: e.status === 'Absent' ? '—' : e.status === 'Checked Out' ? '8h 14m' : '—', extraHours: '0h', status: e.status }))
export const timeOffRequests: TimeOffRequest[] = [
  { id: 'TO-101', employeeId: 'DF-1003', type: 'Paid', from: 'Sep 4, 2026', to: 'Sep 8, 2026', days: 3, reason: 'Family trip', status: 'Pending' },
  { id: 'TO-102', employeeId: 'DF-1002', type: 'Sick', from: 'Aug 18, 2026', to: 'Aug 18, 2026', days: 1, reason: 'Medical appointment', status: 'Approved' },
  { id: 'TO-103', employeeId: 'DF-1005', type: 'Paid', from: 'Oct 12, 2026', to: 'Oct 16, 2026', days: 5, reason: 'Personal leave', status: 'Pending' },
]
export const salaries: Salary[] = employees.map((e, i) => ({ employeeId: e.id, annual: `$${(92000 + i * 6500).toLocaleString()}`, monthly: `$${Math.round((92000 + i * 6500) / 12).toLocaleString()}`, currency: 'USD', paySchedule: 'Monthly' }))

export const api = { baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1', endpoints: { login: '/auth/login', me: '/auth/me', employees: '/employees', attendance: '/attendance', timeOff: '/time-off' } }
export const getEmployee = (id: string) => employees.find((employee) => employee.id === id) ?? employees[0]
export const getSalary = (id: string) => salaries.find((salary) => salary.employeeId === id) ?? salaries[0]
export const getEmployeeName = (id: string) => getEmployee(id).name

export async function login(loginId: string, password: string, role: Role) { return { token: 'mock-token', user: { id: role === 'ADMIN' ? 'DF-ADMIN' : 'DF-1001', name: role === 'ADMIN' ? 'Nora Wilson' : 'Olivia Martin', role, loginId, password } } }
export async function updateAttendance(employeeId: string, action: 'check-in' | 'check-out') { const employee = getEmployee(employeeId); employee.status = action === 'check-in' ? 'Checked In' : 'Checked Out'; const record = attendance.find((item) => item.employeeId === employeeId); if (record) { record.status = employee.status; if (action === 'check-in') record.checkIn = '09:02 AM'; else record.checkOut = '05:30 PM'; } return employee }
export async function createTimeOff(request: Omit<TimeOffRequest, 'id' | 'status'>) { const next = { ...request, id: `TO-${105 + timeOffRequests.length}`, status: 'Pending' as const }; timeOffRequests.unshift(next); return next }
export async function reviewTimeOff(id: string, status: 'Approved' | 'Rejected') { const request = timeOffRequests.find((item) => item.id === id); if (request) request.status = status; return request }
export async function logout() { return true }
export async function getEmployees() { return employees }
export async function getAttendance() { return attendance }
export async function getTimeOff() { return timeOffRequests }
export async function getSalaryInfo(id: string) { return getSalary(id) }

export const navItems = [{ label: 'Employees', path: '/employees' }, { label: 'Attendance', path: '/attendance' }, { label: 'Time Off', path: '/time-off' }]
