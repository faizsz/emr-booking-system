# KlinikKu - Electronic Medical Record (EMR) & Booking System

KlinikKu is a comprehensive web-based application built for managing clinic operations, patient appointments, and electronic medical records (EMR). The system is designed to bridge the interaction between patients and medical staff (Tenaga Kesehatan / Nakes), streamlining the healthcare workflow from booking an appointment to inputting medical records.

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling & UI**: CSS, `clsx`, `tailwind-merge`, Framer Motion (for animations), Lucide React (for icons)
- **Routing**: React Router DOM
- **Backend & Database**: Supabase (PostgreSQL, Authentication, Row Level Security)
- **Deployment**: Configured for Vercel (via `vercel.json`)

## 👥 User Roles & Features

The application utilizes Supabase Authentication and custom profiles to separate access into two main roles:

### 1. Patient (Pasien)
Patients can create an account and manage their healthcare needs.
- **Dashboard**: Overview of their health status and upcoming appointments.
- **Book Appointment**: Book a queue number for a specific polyclinic and doctor on a selected date. The queue number is automatically generated.
- **History**: View past and upcoming appointment statuses (waiting, completed, cancelled).
- **My EMR**: Access their own Electronic Medical Records, containing doctors' diagnoses, actions taken, and prescribed medicines.

### 2. Medical Staff (Nakes)
Medical staff possess elevated privileges to manage clinic operations.
- **Nakes Dashboard**: Overview of clinic statistics and activities.
- **Patient Management**: View all registered patients and appointments across polyclinics.
- **Input EMR**: Update appointment statuses (e.g., from 'waiting' to 'completed') and input patient medical records, including diagnosis, actions, and medicines after a consultation.

## 🗄️ Database Schema & Security

The project relies heavily on **Supabase PostgreSQL** and **Row Level Security (RLS)** to ensure data privacy:
- `profiles`: Stores user data, linked securely to Supabase Auth (`auth.users`).
- `polyclinics` & `doctors`: Master data for available healthcare services.
- `appointments`: Stores booking data with a built-in PostgreSQL trigger `generate_queue_number()` to auto-assign queue numbers per polyclinic per day.
- `medical_records`: Strictly confidential records. Patients can only view their own; Nakes can view all and create new ones.

## 🛠️ Getting Started (Local Development)

### Prerequisites
- Node.js (v18 or higher)
- A Supabase Project

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd EMR
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup:**
   Copy the contents of `supabase_schema.sql` and run it in your Supabase SQL Editor to create the necessary tables, types, policies, and triggers.
   After that, you can run the `seed.mjs` script if you want to populate the database with initial mock data.

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open the App:**
   Visit `http://localhost:5173` in your browser.

## 📦 Deployment

The project contains a `vercel.json` file which configures URL rewrites to support React Router's client-side routing on **Vercel**. When deploying, simply import the repository to Vercel and input your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` into the Vercel Environment Variables settings.
