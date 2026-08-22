'use client'

import { ReactNode, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Check, ChevronLeft, Clock3, Edit3, LoaderCircle, LogIn, LogOut, Plus, Search, ShieldCheck, Trash2, Users, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/auth'
import { ApiError } from '@/services/api-client'
import { hrms } from '@/services/hrms'
import type { Attendance, AuthUser, Employee, EmployeeInput, LeaveType, Salary, TimeOffRequest } from '@/services/types'

type Page = 'overview' | 'employees' | 'attendance' | 'time-off' | 'profile' | 'salary'
type Notice = { tone: 'success' | 'error'; message: string } | null

const DEFAULT_DEMO_CREDENTIALS = { login_id: 'DF-1001', password: 'Employee@123' }

const initialEmployee = (): EmployeeInput => ({ name: '', email: '', employee_id: '', department: '', position: '', mobile: '', company: '', location: '', joining_date: '' })
const initials = (name?: string | null) => (name || '?').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()

const message = (reason: unknown) => {
  if (reason instanceof ApiError) {
    if (reason.status === 401) return 'Invalid login ID or password.'
    return reason.message
  }
  return 'Something went wrong. Please try again.'
}

const when = (value?: string | null) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) : '—'
const totalHours = (value?: number) => value == null ? '—' : `${Math.floor(value)}h ${Math.round((value % 1) * 60)}m`
const today = new Date().toISOString().slice(0, 10)

// Styled submit button — native <button type="submit"> so form submission always works
// (Cannot use @base-ui Button here because it defaults to type="button")
function SubmitButton({ children, busy, className = '' }: { children: ReactNode; busy?: boolean; className?: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all disabled:opacity-50 bg-indigo-600 hover:bg-indigo-700 ${className}`}
    >
      {children}
    </button>
  )
}

function Avatar({ name, large = false }: { name?: string | null; large?: boolean }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full bg-indigo-50 font-semibold text-indigo-700 ${large ? 'size-16 text-xl' : 'size-9 text-xs'}`}>
      {initials(name)}
    </span>
  )
}
function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' }) {
  const styles = { neutral: 'bg-slate-100 text-slate-600', success: 'bg-emerald-50 text-emerald-700', warning: 'bg-amber-50 text-amber-700', danger: 'bg-rose-50 text-rose-700' }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[tone]}`}>{children}</span>
}
function Status({ value }: { value: string }) {
  return <Badge tone={value === 'APPROVED' || value === 'PRESENT' ? 'success' : value === 'PENDING' ? 'warning' : value === 'REJECTED' ? 'danger' : 'neutral'}>{value.replace('_', ' ')}</Badge>
}
function Loading({ label = 'Loading…' }: { label?: string }) {
  return <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="size-4 animate-spin" />{label}</div>
}
function Empty({ title, detail }: { title: string; detail: string }) {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><p className="font-medium">{title}</p><p className="mt-1 text-sm text-slate-500">{detail}</p></div>
}
function Title({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{detail}</p>
      </div>
      {action}
    </div>
  )
}
function Field({ label, value, setValue, type = 'text', required = false }: { label: string; value: string; setValue: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="h-9 rounded-md border border-slate-200 bg-white px-3 font-normal text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  )
}
function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/25 p-4">
      <section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="inline-flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

// ---- Login Form ----
// Uses a plain <form> + native submit button so that clicking "Sign in"
// or pressing Enter reliably triggers form submission.
function LoginForm({ onSubmit, busy, error, onCancel }: {
  onSubmit: (loginId: string, password: string) => Promise<void>
  busy: boolean
  error: string
  onCancel?: () => void
}) {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id.trim() || !password.trim()) return
    await onSubmit(id.trim(), password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <p className="text-sm text-slate-500">
        Sign in with your Dayflow credentials — e.g.{' '}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-indigo-700">admin</code>{' '}
        for Admin or{' '}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-indigo-700">DF-1001</code>{' '}
        for Employee.
      </p>
      <Field label="Login ID" value={id} setValue={setId} required />
      <Field label="Password" value={password} setValue={setPassword} type="password" required />
      {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}
      <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <SubmitButton busy={busy} className="h-9 min-w-[90px]">
          {busy ? <><LoaderCircle className="size-4 animate-spin" /> Signing in…</> : 'Sign in'}
        </SubmitButton>
      </div>
    </form>
  )
}

function LoginStandalone({ login }: { login: (loginId: string, password: string) => Promise<void> }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (id: string, password: string) => {
    setBusy(true)
    setError('')
    try {
      await login(id, password)
    } catch (reason) {
      setError(message(reason))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-indigo-600 text-white"><ShieldCheck /></span>
          <div>
            <h1 className="font-semibold text-slate-900">Dayflow</h1>
            <p className="text-sm text-slate-500">Human Resource Management</p>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">Sign in</h2>
        <p className="mb-6 mt-1 text-sm text-slate-500">Enter your credentials to access your HR workspace.</p>
        <LoginForm onSubmit={submit} busy={busy} error={error} />
      </div>
    </main>
  )
}

function EmployeeForm({ employee, save, cancel, busy }: { employee: EmployeeInput; save: (employee: EmployeeInput) => Promise<void>; cancel: () => void; busy: boolean }) {
  const [value, setValue] = useState(employee)
  const update = (key: keyof EmployeeInput) => (next: string) => setValue((current) => ({ ...current, [key]: next || null }))
  return (
    <form onSubmit={(e) => { e.preventDefault(); void save(value) }} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" value={value.name} setValue={update('name')} required />
        <Field label="Email" value={value.email} setValue={update('email')} type="email" required />
        <Field label="Employee code" value={value.employee_id || ''} setValue={update('employee_id')} />
        <Field label="Mobile" value={value.mobile || ''} setValue={update('mobile')} />
        <Field label="Department" value={value.department || ''} setValue={update('department')} />
        <Field label="Position" value={value.position || ''} setValue={update('position')} />
        <Field label="Company" value={value.company || ''} setValue={update('company')} />
        <Field label="Location" value={value.location || ''} setValue={update('location')} />
        <Field label="Joining date" value={value.joining_date || ''} setValue={update('joining_date')} type="date" />
      </div>
      <div className="flex justify-end gap-2 border-t pt-4">
        <button type="button" onClick={cancel} className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          Cancel
        </button>
        <SubmitButton busy={busy}>
          {busy ? <><LoaderCircle className="size-4 animate-spin" /> Saving…</> : 'Save employee'}
        </SubmitButton>
      </div>
    </form>
  )
}

function Shell({ page, user, changePage, logout, openLogin, children }: {
  page: Page; user: AuthUser; changePage: (page: Page) => void; logout: () => void; openLogin: () => void; children: ReactNode
}) {
  const menu: Array<[Page, string, typeof Users]> = [
    ['overview', 'Overview', Users],
    ['employees', 'Employees', Users],
    ['attendance', 'Attendance', Clock3],
    ['time-off', 'Time off', CalendarDays],
  ]
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-7">
          <button onClick={() => changePage('overview')} className="flex items-center gap-2 font-semibold text-slate-900">
            <span className="flex size-8 items-center justify-center rounded-md bg-indigo-600 text-white"><ShieldCheck size={17} /></span>
            Dayflow
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => changePage('profile')} className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-slate-100">
              <Avatar name={user.name} />
              <span className="hidden sm:inline font-medium">{user.name || user.role}</span>
            </button>
            <Button variant="outline" size="sm" onClick={openLogin}>
              <LogIn className="size-4" />
              <span className="hidden sm:inline">Switch account</span>
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1440px]">
        <aside className="w-16 shrink-0 border-r border-slate-200 bg-white sm:w-56">
          <nav className="sticky top-16 flex flex-col gap-1 p-2 sm:p-3">
            {menu.map(([target, label, Icon]) => (
              <button
                key={target}
                onClick={() => changePage(target)}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm ${page === target ? 'bg-indigo-50 font-medium text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Icon size={17} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
            {user.role === 'ADMIN' && (
              <button
                onClick={() => changePage('salary')}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm ${page === 'salary' ? 'bg-indigo-50 font-medium text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="text-base">₹</span>
                <span className="hidden sm:inline">Salary</span>
              </button>
            )}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  )
}

export default function DayflowApp() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [page, setPage] = useState<Page>('overview')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [requests, setRequests] = useState<TimeOffRequest[]>([])
  const [selected, setSelected] = useState<Employee | null>(null)
  const [salary, setSalary] = useState<Salary | null>(null)
  const [restoring, setRestoring] = useState(true)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [loginBusy, setLoginBusy] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState<Notice>(null)
  const [employeeDialog, setEmployeeDialog] = useState<'create' | 'edit' | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const isAdmin = user?.role === 'ADMIN'
  const ownId = user?.employee_id || ''

  const flash = (tone: 'success' | 'error', text: string) => {
    setNotice({ tone, message: text })
    window.setTimeout(() => setNotice(null), 4500)
  }

  const load = async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const people = isAdmin ? await hrms.employees() : ownId ? [await hrms.employee(ownId)] : []
      const [records, leave] = await Promise.all([
        isAdmin ? hrms.attendance() : ownId ? hrms.employeeAttendance(ownId) : Promise.resolve([]),
        hrms.timeOff(),
      ])
      setEmployees(people)
      setAttendance(records)
      setRequests(leave)
    } catch (reason) {
      setError(message(reason))
    } finally {
      setLoading(false)
    }
  }

  // On mount: restore session, or fall back to default demo employee DF-1001
  useEffect(() => {
    const initSession = async () => {
      try {
        const sessionUser = await authService.restoreSession()
        if (sessionUser) {
          setUser(sessionUser)
          return
        }
      } catch {
        // ignore
      }
      try {
        const demoUser = await authService.login(DEFAULT_DEMO_CREDENTIALS)
        setUser(demoUser)
      } catch {
        setUser(null)
      }
    }
    void initSession().finally(() => setRestoring(false))
  }, [])

  useEffect(() => { void load() }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const openEmployee = async (emp: Employee) => {
    setSelected(emp)
    setPage('profile')
    setLoading(true)
    setError('')
    try { setSelected(await hrms.profile(emp.id)) }
    catch (reason) { setError(message(reason)) }
    finally { setLoading(false) }
  }

  const saveEmployee = async (input: EmployeeInput) => {
    setBusy(true)
    try {
      const creating = employeeDialog === 'create'
      const result = creating
        ? await hrms.createEmployee(input)
        : !isAdmin && selected!.id === ownId
        ? await hrms.updateProfile(selected!.id, input)
        : await hrms.updateEmployee(selected!.id, input)
      setSelected(result)
      setEmployeeDialog(null)
      flash('success', creating ? 'Employee created.' : 'Employee updated.')
      await load()
      if (creating) await openEmployee(result)
    } catch (reason) {
      flash('error', message(reason))
    } finally {
      setBusy(false)
    }
  }

  const handleSwitchAccount = async (loginId: string, password: string) => {
    setLoginBusy(true)
    setLoginError('')
    try {
      const loggedInUser = await authService.login({ login_id: loginId, password })
      setUser(loggedInUser)
      setSelected(null)
      setSalary(null)
      setPage('overview')
      setShowLoginModal(false)
      flash('success', `Signed in as ${loggedInUser.name || loggedInUser.role}.`)
    } catch (reason) {
      setLoginError(message(reason))
    } finally {
      setLoginBusy(false)
    }
  }

  const handleLogout = async () => {
    try { await authService.logout() } catch { /* ignore */ }
    setSelected(null)
    setSalary(null)
    setPage('overview')
    try {
      const demoUser = await authService.login(DEFAULT_DEMO_CREDENTIALS)
      setUser(demoUser)
      flash('success', 'Signed out. Viewing default employee demo.')
    } catch {
      setUser(null)
    }
  }

  if (restoring) return <Loading label="Starting Dayflow…" />
  if (!user) return <LoginStandalone login={async (id, pw) => { setUser(await authService.login({ login_id: id, password: pw })); setPage('overview') }} />

  const employee = selected || employees.find((p) => p.id === ownId) || null

  return (
    <Shell page={page} user={user} changePage={setPage} logout={() => void handleLogout()} openLogin={() => { setLoginError(''); setShowLoginModal(true) }}>
      {notice && (
        <div className={`mb-5 rounded-md border px-4 py-3 text-sm ${notice.tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
          {notice.message}
        </div>
      )}
      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
          <Button variant="outline" size="sm" onClick={() => void load()}>Retry</Button>
        </div>
      )}

      {page === 'overview' && <Overview employees={employees} attendance={attendance} requests={requests} loading={loading} />}
      {page === 'employees' && <Employees employees={employees} loading={loading} admin={isAdmin} open={openEmployee} create={() => setEmployeeDialog('create')} />}
      {page === 'profile' && (
        <Profile
          employee={employee}
          loading={loading}
          admin={isAdmin}
          ownId={ownId}
          back={() => setPage('employees')}
          edit={() => setEmployeeDialog('edit')}
          remove={async () => {
            if (!employee || !window.confirm(`Delete ${employee.name}? This cannot be undone.`)) return
            setBusy(true)
            try {
              await hrms.deleteEmployee(employee.id)
              setSelected(null)
              setPage('employees')
              flash('success', 'Employee deleted.')
              await load()
            } catch (reason) { flash('error', message(reason)) }
            finally { setBusy(false) }
          }}
          busy={busy}
        />
      )}
      {page === 'attendance' && (
        <AttendancePage
          records={attendance}
          people={employees}
          loading={loading}
          admin={isAdmin}
          busy={busy}
          action={async (type) => {
            setBusy(true)
            try {
              await (type === 'in' ? hrms.checkIn() : hrms.checkOut())
              flash('success', type === 'in' ? 'Checked in.' : 'Checked out.')
              await load()
            } catch (reason) { flash('error', message(reason)) }
            finally { setBusy(false) }
          }}
        />
      )}
      {page === 'time-off' && (
        <TimeOff
          requests={requests}
          loading={loading}
          admin={isAdmin}
          busy={busy}
          submit={async (input) => {
            setBusy(true)
            try {
              await hrms.createTimeOff(input)
              flash('success', 'Time-off request submitted.')
              await load()
            } catch (reason) { flash('error', message(reason)) }
            finally { setBusy(false) }
          }}
          review={async (id, approved, comment) => {
            setBusy(true)
            try {
              await (approved ? hrms.approveTimeOff(id, comment) : hrms.rejectTimeOff(id, comment))
              flash('success', approved ? 'Request approved.' : 'Request rejected.')
              await load()
            } catch (reason) { flash('error', message(reason)) }
            finally { setBusy(false) }
          }}
        />
      )}
      {page === 'salary' && (
        <SalaryPage
          people={employees}
          selected={employee}
          salary={salary}
          loading={loading}
          busy={busy}
          choose={async (person) => {
            setSelected(person)
            setLoading(true)
            try { setSalary(await hrms.salary(person.id)) }
            catch (reason) { flash('error', message(reason)) }
            finally { setLoading(false) }
          }}
          save={async (next) => {
            if (!employee || !salary) return
            setBusy(true)
            try {
              setSalary(await hrms.updateSalary(employee.id, next))
              flash('success', 'Salary updated.')
            } catch (reason) { flash('error', message(reason)) }
            finally { setBusy(false) }
          }}
        />
      )}

      {employeeDialog && (
        <Dialog title={employeeDialog === 'create' ? 'Add employee' : 'Edit employee'} onClose={() => setEmployeeDialog(null)}>
          <EmployeeForm
            employee={employeeDialog === 'create' ? initialEmployee() : { ...employee! }}
            save={saveEmployee}
            cancel={() => setEmployeeDialog(null)}
            busy={busy}
          />
        </Dialog>
      )}

      {showLoginModal && (
        <Dialog title="Switch account" onClose={() => { setShowLoginModal(false); setLoginError('') }}>
          <LoginForm
            onSubmit={handleSwitchAccount}
            busy={loginBusy}
            error={loginError}
            onCancel={() => { setShowLoginModal(false); setLoginError('') }}
          />
        </Dialog>
      )}
    </Shell>
  )
}

// ---- Sub-pages ----

function Overview({ employees, attendance, requests, loading }: { employees: Employee[]; attendance: Attendance[]; requests: TimeOffRequest[]; loading: boolean }) {
  if (loading) return <Loading />
  const cards = [
    ['Total employees', employees.length],
    ['Currently checked in', attendance.filter((r) => r.check_in && !r.check_out).length],
    ['Attendance records', attendance.length],
    ['Pending leave requests', requests.filter((r) => r.status === 'PENDING').length],
  ]
  return (
    <>
      <Title title="Overview" detail="A concise snapshot of your people and activity." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <section key={String(label)} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
          </section>
        ))}
      </div>
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Recent time-off requests</h2>
        {requests.length ? (
          <div className="mt-4 divide-y">
            {requests.slice(0, 5).map((req) => (
              <div className="flex justify-between py-3 text-sm" key={req.id}>
                <span>{req.leave_type} leave · {when(req.start_date)}</span>
                <Status value={req.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No time-off requests yet.</p>
        )}
      </section>
    </>
  )
}

function Employees({ employees, loading, admin, open, create }: { employees: Employee[]; loading: boolean; admin: boolean; open: (emp: Employee) => void; create: () => void }) {
  const [query, setQuery] = useState('')
  const visible = useMemo(() => employees.filter((e) => `${e.name} ${e.department || ''} ${e.position || ''}`.toLowerCase().includes(query.toLowerCase())), [employees, query])
  return (
    <>
      <Title
        title="Employees"
        detail={admin ? 'Manage employees and their profiles.' : 'View your profile.'}
        action={admin ? (
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={create}><Plus />Add employee</Button>
        ) : undefined}
      />
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search employees" className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-indigo-400" />
      </div>
      {loading ? <Loading /> : !visible.length ? (
        <Empty title="No employees found" detail={query ? 'Try a different search term.' : 'Employees will appear here once added.'} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((person) => (
            <button key={person.id} onClick={() => void open(person)} className="rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-indigo-200 hover:shadow">
              <div className="flex items-center gap-3">
                <Avatar name={person.name} />
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{person.name}</h2>
                  <p className="truncate text-sm text-slate-500">{person.position || 'No position'}</p>
                </div>
              </div>
              <div className="mt-5 space-y-2 text-sm">
                <p className="flex justify-between gap-3"><span className="text-slate-500">Employee ID</span><span className="truncate">{person.employee_id}</span></p>
                <p className="flex justify-between gap-3"><span className="text-slate-500">Department</span><span className="truncate">{person.department || '—'}</span></p>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  )
}

function Profile({ employee, loading, admin, ownId, back, edit, remove, busy }: {
  employee: Employee | null; loading: boolean; admin: boolean; ownId: string
  back: () => void; edit: () => void; remove: () => Promise<void>; busy: boolean
}) {
  const [tab, setTab] = useState<'profile' | 'private'>('profile')
  if (loading) return <Loading />
  if (!employee) return <Empty title="Employee not found" detail="Return to the employee list and select a profile." />
  const editable = admin || employee.id === ownId
  const rows = tab === 'profile'
    ? [['Email', employee.email], ['Mobile', employee.mobile], ['Department', employee.department], ['Position', employee.position], ['Company', employee.company], ['Location', employee.location], ['Joined', when(employee.joining_date)], ['Employee ID', employee.employee_id]]
    : [['Address', employee.address], ['Date of birth', when(employee.date_of_birth)], ['About', employee.about], ['Interests', employee.interests], ['Skills', employee.skills?.join(', ')], ['Certifications', employee.certifications?.join(', ')]]
  return (
    <>
      <button onClick={back} className="mb-5 flex items-center gap-1 text-sm text-slate-600 hover:text-indigo-700"><ChevronLeft size={16} />Back to employees</button>
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <Avatar name={employee.name} large />
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">{employee.name}</h1>
            <p className="mt-1 text-slate-500">{employee.position || 'No position'} · {employee.department || 'No department'}</p>
          </div>
          {editable && <Button variant="outline" onClick={edit}><Edit3 />Edit information</Button>}
          {admin && (
            <Button variant="destructive" onClick={() => void remove()} disabled={busy}>
              {busy && <LoaderCircle className="animate-spin" />}<Trash2 />Delete
            </Button>
          )}
        </div>
        <div className="border-y border-slate-200 px-6">
          <button onClick={() => setTab('profile')} className={`mr-6 border-b-2 py-3 text-sm font-medium ${tab === 'profile' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500'}`}>Profile</button>
          <button onClick={() => setTab('private')} className={`border-b-2 py-3 text-sm font-medium ${tab === 'private' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500'}`}>Private information</button>
        </div>
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-1 text-sm text-slate-800">{value || '—'}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function AttendancePage({ records, people, loading, admin, busy, action }: {
  records: Attendance[]; people: Employee[]; loading: boolean; admin: boolean; busy: boolean; action: (type: 'in' | 'out') => Promise<void>
}) {
  return (
    <>
      <Title
        title="Attendance"
        detail={admin ? 'Review attendance across your organization.' : 'Track your check-in, check-out, and working hours.'}
        action={!admin ? (
          <div className="flex gap-2">
            <Button variant="outline" disabled={busy} onClick={() => void action('in')}><Check />Check in</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" disabled={busy} onClick={() => void action('out')}><LogOut />Check out</Button>
          </div>
        ) : undefined}
      />
      {loading ? <Loading /> : !records.length ? (
        <Empty title="No attendance records" detail="Attendance history will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {[...(admin ? ['Employee'] : []), 'Date', 'Check in', 'Check out', 'Work hours', 'Extra hours', 'Status'].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((rec) => (
                <tr key={rec.id}>
                  {admin && <td className="px-4 py-3">{people.find((p) => p.id === rec.employee_id)?.name || rec.employee_id}</td>}
                  <td className="px-4 py-3">{when(rec.date)}</td>
                  <td className="px-4 py-3">{rec.check_in ? new Date(rec.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td className="px-4 py-3">{rec.check_out ? new Date(rec.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td className="px-4 py-3">{totalHours(rec.work_hours)}</td>
                  <td className="px-4 py-3">{totalHours(rec.extra_hours)}</td>
                  <td className="px-4 py-3"><Status value={rec.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function TimeOff({ requests, loading, admin, busy, submit, review }: {
  requests: TimeOffRequest[]; loading: boolean; admin: boolean; busy: boolean
  submit: (input: { leave_type: LeaveType; start_date: string; end_date: string; remarks: string | null }) => Promise<void>
  review: (id: string, approved: boolean, comment: string) => Promise<void>
}) {
  const [kind, setKind] = useState<LeaveType>('PAID')
  const [start, setStart] = useState(today)
  const [end, setEnd] = useState(today)
  const [reason, setReason] = useState('')
  const [comment, setComment] = useState('')
  return (
    <>
      <Title title="Time off" detail={admin ? 'Review and manage leave requests.' : 'Request time off and view your history.'} />
      {!admin && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void submit({ leave_type: kind, start_date: start, end_date: end, remarks: reason || null }).then(() => setReason(''))
          }}
          className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="font-semibold">Request time off</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Leave type
              <select value={kind} onChange={(e) => setKind(e.target.value as LeaveType)} className="h-9 rounded-md border border-slate-200 bg-white px-3 font-normal">
                <option value="PAID">Paid</option>
                <option value="SICK">Sick</option>
                <option value="UNPAID">Unpaid</option>
              </select>
            </label>
            <Field label="Start date" value={start} setValue={setStart} type="date" required />
            <Field label="End date" value={end} setValue={setEnd} type="date" required />
          </div>
          <label className="mt-4 flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Reason
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-20 rounded-md border border-slate-200 p-3 font-normal" placeholder="Add a short reason" />
          </label>
          <SubmitButton busy={busy} className="mt-4">
            {busy ? <><LoaderCircle className="size-4 animate-spin" /> Submitting…</> : 'Submit request'}
          </SubmitButton>
        </form>
      )}
      {loading ? <Loading /> : !requests.length ? (
        <Empty title="No time-off requests" detail="Requests will appear here once submitted." />
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold">{admin ? 'All requests' : 'My requests'}</h2>
            {admin && (
              <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional comment for approval or rejection" className="mt-3 h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400" />
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {requests.map((req) => (
              <div key={req.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{req.leave_type} leave</p>
                    <Status value={req.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{when(req.start_date)} – {when(req.end_date)}</p>
                  {req.remarks && <p className="mt-1 text-sm">{req.remarks}</p>}
                  {req.admin_comment && <p className="mt-1 text-sm text-slate-500">Admin comment: {req.admin_comment}</p>}
                </div>
                {admin && req.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button variant="outline" disabled={busy} onClick={() => void review(req.id, false, comment)}>Reject</Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700" disabled={busy} onClick={() => void review(req.id, true, comment)}>Approve</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm text-slate-800">{value}</p>
    </div>
  )
}

function SalaryPage({ people, selected, salary, loading, busy, choose, save }: {
  people: Employee[]; selected: Employee | null; salary: Salary | null; loading: boolean; busy: boolean
  choose: (person: Employee) => Promise<void>; save: (value: Partial<Salary>) => Promise<void>
}) {
  const [monthly, setMonthly] = useState('')
  useEffect(() => setMonthly(salary ? String(salary.monthly_wage) : ''), [salary])
  return (
    <>
      <Title title="Salary" detail="Salary information is available only to administrators." />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <p className="p-2 text-xs font-medium uppercase tracking-wide text-slate-400">Employees</p>
          {people.map((person) => (
            <button key={person.id} onClick={() => void choose(person)} className={`flex w-full items-center gap-3 rounded-md p-3 text-left text-sm ${selected?.id === person.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'}`}>
              <Avatar name={person.name} />
              <span className="truncate">{person.name}</span>
            </button>
          ))}
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? <Loading /> : !selected ? (
            <Empty title="Select an employee" detail="Choose an employee to view salary details." />
          ) : !salary ? (
            <Empty title="No salary record" detail="No salary data available for this employee." />
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); void save({ monthly_wage: Number(monthly), yearly_wage: Number(monthly) * 12 }) }}>
              <h2 className="text-lg font-semibold">{selected.name}</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="Monthly wage (₹)" type="number" value={monthly} setValue={setMonthly} required />
                <Info label="Yearly wage (₹)" value={Number(monthly || 0) * 12} />
                <Info label="Working days" value={salary.working_days} />
                <Info label="Break time" value={`${salary.break_time} minutes`} />
              </div>
              <SubmitButton busy={busy} className="mt-6">
                {busy ? <><LoaderCircle className="size-4 animate-spin" /> Saving…</> : 'Save salary'}
              </SubmitButton>
            </form>
          )}
        </section>
      </div>
    </>
  )
}
