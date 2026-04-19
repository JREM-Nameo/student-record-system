// app/layout.js
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import './globals.css'

export const metadata = {
  title: 'StudentMS — Student Record Management System',
  description: 'Manage student records, grades, and academic information.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-slate-900">
      <body className="bg-slate-900 min-h-screen text-white antialiased">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#1e293b' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
          }}
        />
      </body>
    </html>
  )
}