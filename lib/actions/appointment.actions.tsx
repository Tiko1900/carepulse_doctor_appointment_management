"use server";

import twilio from "twilio";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../supabase/supabase-admin";
import { formatDateTime } from "../utils";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);


// CREATE APPOINTMENT
export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("appointments")
      .insert(appointment)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin");
    return data;
  } catch (error) {
    console.error("An error occurred while creating a new appointment:", error);
  }
};

// GET RECENT APPOINTMENTS
export const getRecentAppointmentList = async () => {
  try {
    const { data: appointments, error } = await supabaseAdmin
      .from("appointments")
      .select(`*, patient:patients (*)`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };

    const counts = appointments.reduce((acc, appointment) => {
      switch (appointment.status) {
        case "scheduled":
          acc.scheduledCount++;
          break;
        case "pending":
          acc.pendingCount++;
          break;
        case "cancelled":
          acc.cancelledCount++;
          break;
      }

      return acc;
    }, initialCounts);

    return {
      totalCount: appointments.length,
      ...counts,
      documents: appointments,
    };
  } catch (error) {
    console.error(
      "An error occurred while retrieving the recent appointments:",
      error
    );
  }
};

export const sendSMSNotification = async (
  phone: string,
  content: string
) => {
  try {
    const message = await client.messages.create({
      body: content,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone,
    });

    return {
      success: true,
      message
    }
  } catch (error) {
    console.error("An error occurred while sending sms:", error);
  }
};

// UPDATE APPOINTMENT
export const updateAppointment = async ({
  appointment_id,
  time_zone,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    const { data: updatedAppointment, error } = await supabaseAdmin
      .from("appointments")
      .update(appointment)
      .eq("id", appointment_id)
      .select(`*, patient:patients (*)`)
      .single();

    if (error) throw error;

    const smsMessage = `Greetings from CarePulse. ${
      type === "schedule"
        ? `Your appointment is confirmed for ${formatDateTime(
            appointment.schedule!,
            time_zone
          ).dateTime} with Dr. ${appointment.primary_physician}`
        : `We regret to inform that your appointment for ${formatDateTime(
            appointment.schedule!,
            time_zone
          ).dateTime} is cancelled. Reason: ${
            appointment.cancellation_reason
          }`
    }.`;

    console.log(updatedAppointment.patient.phone)

    await sendSMSNotification(updatedAppointment.patient.phone, smsMessage);

    revalidatePath("/admin");
    return updatedAppointment;
  } catch (error) {
    console.error("An error occurred while scheduling an appointment:", error);
  }
};

// GET APPOINTMENT
export const getAppointment = async (appointmentId: string) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .maybeSingle();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(
      "An error occurred while retrieving the existing appointment:",
      error
    );
  }
};