export interface Patient {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  birth_date: string; // YYYY-MM-DD
  gender: Gender;
  address: string;
  occupation: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
  primary_physician: string;
  insurance_provider: string;
  insurance_policy_number: string;
  allergies: string | null;
  current_medication: string | null;
  family_medical_history: string | null;
  past_medical_history: string | null;
  identification_type: string | null;
  identification_number: string | null;
  identification_document_url: string | null;
  privacy_consent: boolean;
}

export interface Appointment {
  id: string;
  patient_id: string;
  patient: Patient;
  user_id: string;
  schedule: string; // ISO datetime
  status: Status;
  primary_physician: string;
  reason: string;
  note: string | null;
  cancellation_reason: string | null;
}