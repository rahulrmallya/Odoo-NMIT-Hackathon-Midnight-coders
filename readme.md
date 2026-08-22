# Dayflow – HR Management System

Dayflow is a lightweight HR Management System designed to simplify employee management, attendance tracking, and time-off management.

The project is being developed as part of the **Odoo NMIT Hackathon – Midnight Coders**.

## Features

### Admin

* View and manage employees
* View employee profiles
* View attendance records
* Manage time-off requests
* Approve or reject time-off requests
* View salary information
* Edit employee information

### Employee

* View employee directory
* View personal profile
* View personal attendance
* Check in and check out
* Apply for time off
* View personal time-off requests
* Salary information is restricted from employees

## Main Modules

* **Overview** – HR summary and key employee statistics
* **Employees** – Employee directory and employee management
* **Profile** – Employee information and profile details
* **Attendance** – Check-in, check-out, and attendance records
* **Time Off** – Leave requests, calendar, approval, and rejection

## Frontend

The current application is built with:

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui components

The frontend is designed to be:

* Clean and professional
* Desktop-first and responsive
* Lightweight and easy to maintain
* Focused on usability rather than visual effects

## Project Structure

```text
app/
├── globals.css
├── layout.tsx
└── page.tsx

components/
├── ui/
└── dayflow-app.tsx

lib/
services/
public/
```

## Getting Started

Clone the repository:

```bash
git clone https://github.com/rahulrmallya/Odoo-NMIT-Hackathon-Midnight-coders.git
```

Move into the project:

```bash
cd Odoo-NMIT-Hackathon-Midnight-coders
```

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

The application will be available locally through the development server.

## Backend

The backend is being developed separately.

The frontend currently uses service-layer/mock data where applicable so that the UI can be developed independently from the backend implementation.

Backend integration will be handled separately without changing the core frontend user experience.

## User Roles

| Role     | Access                                            |
| -------- | ------------------------------------------------- |
| Admin    | Employees, profiles, attendance, time off, salary |
| Employee | Employees, own profile, own attendance, time off  |

## Design

Dayflow follows a simple enterprise-style interface:

* White background
* Dark text
* Light borders
* Blue primary accent
* Compact cards and tables
* Simple icons
* Responsive layout
* Minimal animations

## Team

**Odoo NMIT Hackathon – Midnight Coders**

Built collaboratively as part of the hackathon project.

## Project Status

🚧 **In Development**

Frontend functionality is being developed using mock/service data while the backend is developed separately. 
