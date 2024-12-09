import { Session } from '@supabase/supabase-js';
import { atom } from 'jotai/vanilla';

export const supabaseSession = atom<Session | null>(null);
