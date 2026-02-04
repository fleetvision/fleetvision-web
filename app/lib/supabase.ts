import { createClient } from '@supabase/supabase-js'

// Tus llaves de Supabase (las encuentras en la página de Supabase)
const supabaseUrl = 'https://yyvoktzawdhddfmyaiyv.supabase.co'  // ⬅️ CAMBIA ESTO
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5dm9rdHphd2RoZGRmbXlhaXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODkxODEsImV4cCI6MjA4NTQ2NTE4MX0.xMWPDtOAPykK4mu8gPeUuKYafyvkgE-YItxZf2SVy5g'        // ⬅️ CAMBIA ESTO

// Crea el "teléfono" para hablar con Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)