import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import Recipes from './pages/Recipes'
import RecipeDetail from './pages/RecipeDetail'
import MealPlan from './pages/MealPlan'
import ShoppingList from './pages/ShoppingList'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import CreateRecipe from './pages/CreateRecipe'
import Scanner from './pages/Scanner'
import Evolution from './pages/Evolution'
import Onboarding from './pages/Onboarding'
import { AppProvider, useAppStore } from './stores/useAppStore'
import { ThemeProvider } from 'next-themes'
import { useState, useEffect } from 'react'
import { SplashScreen } from './components/SplashScreen'
import { AuthProvider, useAuth } from './hooks/use-auth'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  const { isOnboardingCompleted } = useAppStore()

  if (loading) return null
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Force onboarding check - Smart Navigation Logic
  if (!isOnboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}

const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  const { isOnboardingCompleted } = useAppStore()

  if (loading) return null
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Prevent returning users from seeing onboarding
  if (isOnboardingCompleted) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()

  if (loading) return null
  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <Onboarding />
          </OnboardingRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Index />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/create" element={<CreateRecipe />} />
        <Route path="/recipes/scan" element={<Scanner />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/plan" element={<MealPlan />} />
        <Route path="/shop" element={<ShoppingList />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/evolution" element={<Evolution />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Internationalization: Set language to pt-br as per requirements
    document.documentElement.lang = 'pt-br'
  }, [])

  if (loading) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SplashScreen onFinish={() => setLoading(false)} />
      </ThemeProvider>
    )
  }

  return (
    <BrowserRouter
      future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
    >
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <AppProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AppRoutes />
            </TooltipProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
