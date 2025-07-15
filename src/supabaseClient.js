import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mwretrwmbfbqwmseyyhk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13cmV0cndtYmZicXdtc2V5eWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNDEyODMsImV4cCI6MjA2NzcxNzI4M30.2VU-5yI6gSDfbpYT9hAbK1ZsCll9JIHYzkze2y3UWOw'; // Replace with your actual anon key from Supabase project settings

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 