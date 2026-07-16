import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import { AuthProvider } from '@/hooks/use-auth'
import { DataProvider } from '@/hooks/use-data'

import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Index from '@/pages/Index'
import Trips from '@/pages/Trips'
import Expenses from '@/pages/Expenses'
import Reports from '@/pages/Reports'
import NotFound from '@/pages/NotFound'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
