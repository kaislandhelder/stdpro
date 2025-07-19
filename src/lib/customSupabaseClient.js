import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kyzileoprmzoonhvkcvu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5emlsZW9wcm16b29uaHZrY3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2OTQzNTUsImV4cCI6MjA2ODI3MDM1NX0.u2X2rzWiODhpAtcCmcwUk9_MAfa0FT_cvWnkDQFIBow';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);