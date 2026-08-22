export type Role = 'ADMIN' | 'EMPLOYEE'
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE'
export type LeaveType = 'PAID' | 'SICK' | 'UNPAID'
export type TimeOffStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type AuthUser = {
  id: string
  employee_id: string | null
  name: string | null
  email: string | null
  role: Role
}

export type LoginRequest = { login_id: string; password: string }
export type LoginResponse = { access_token: string; token_type: 'bearer'; user: AuthUser }

export type Employee = {
  id: string
  employee_id: string
  name: string
  email: string
  mobile: string | null
  profile_picture: string | null
  company: string | null
  department: string | null
  position: string | null
  manager_id: string | null
  location: string | null
  joining_date: string | null
  date_of_birth: string | null
  address: string | null
  about: string | null
  interests: string | null
  skills: string[]
  certifications: string[]
}

export type Attendance = {
  id: string
  employee_id: string
  date: string
  check_in: string | null
  check_out: string | null
  work_hours: number
  extra_hours: number
  status: AttendanceStatus
}

export type TimeOffRequest = {
  id: string
  employee_id: string
  leave_type: LeaveType
  start_date: string
  end_date: string
  remarks: string | null
  status: TimeOffStatus
  admin_comment: string | null
}

export type SalaryComponents = {
  basic_salary: number
  hra: number
  standard_allowance: number
  performance_bonus: number
  leave_travel_allowance: number
  fixed_allowance: number
}

export type Salary = {
  id: string
  employee_id: string
  monthly_wage: number
  yearly_wage: number
  working_days: number
  break_time: number
  salary_components: SalaryComponents
}
