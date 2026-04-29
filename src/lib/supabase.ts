import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lbwjdleewjtlqhnjwzsn.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxid2pkbGVld2p0bHFobmp3enNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODEyNzAsImV4cCI6MjA5MjE1NzI3MH0.U8D4EMaPwKNnDchYpUyHd1SoAVqhl4jmNmI53MIHWNY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
