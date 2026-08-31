import { createClient } from '@supabase/supabase-js'

// Você precisará pegar esses dados lá no painel do Supabase (Project Settings > API)
const supabaseUrl = 'https://yucbbbdiedeawgcgcris.supabase.co'
const supabaseKey = 'sb_publishable_14MYfGI3Xnf8IvH25cw9pw_oTImGaVw'

export const supabase = createClient(supabaseUrl, supabaseKey)