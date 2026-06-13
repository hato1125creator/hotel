export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          name: string
          description: string | null
          capacity: number
          price_per_night: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          capacity?: number
          price_per_night: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          capacity?: number
          price_per_night?: number
          is_active?: boolean
          created_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          room_id: string
          guest_name: string
          guest_email: string
          guest_phone: string | null
          check_in: string
          check_out: string
          num_guests: number
          total_price: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out'
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          sesame_pin: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          guest_name: string
          guest_email: string
          guest_phone?: string | null
          check_in: string
          check_out: string
          num_guests?: number
          total_price: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out'
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          sesame_pin?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          guest_name?: string
          guest_email?: string
          guest_phone?: string | null
          check_in?: string
          check_out?: string
          num_guests?: number
          total_price?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out'
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          sesame_pin?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      reservation_status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out'
    }
  }
}
