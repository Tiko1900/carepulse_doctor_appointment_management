"use server";

import { supabaseAdmin } from "../supabase/supabase-admin";

export const createUser = async (user: CreateUserParams) => {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: user.email,
    phone: user.phone,
    user_metadata: {
      name: user.name,
    },
  });

  if (error) {
    console.error("Error creating user:", error);
    throw new Error(error.message);
  }

  return data.user;
};

export const getUser = async (userId: string) => {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (error) {
    console.error("Error getting user", error);
    throw new Error(error.message);
  }

  if (!data.user) return undefined;

  return {
    id: data.user.id,
    name: data.user.user_metadata?.name || "",
    email: data.user.email || "",
    phone: data.user.phone || "",
  };
};


export const getPatient = async (userId: string) => {
  try{
    const { data, error } = await supabaseAdmin
      .from("patients")
      .select("*")
      .eq('user_id', userId)
      .maybeSingle();

    if(error) throw error;

    return data;
  }catch(error){
    console.error("error getting patient.", error);
  }
}

export const registerPatient = async ({ identification_document, ...patient }: RegisterUserParams) => {
  try{
    let fileUrl;
    if(identification_document) {
      const file = identification_document.get('blobFile') as Blob;
      const fileName = identification_document.get('fileName') as string;

      const { data, error } = await supabaseAdmin.storage
        .from('patient-documents')
        .upload(`patients/${Date.now()}-${fileName}`, file);

      if(error) throw error;

      const { data: publicUrl } = supabaseAdmin.storage.from('patient-documents').getPublicUrl(data.path);

      fileUrl = publicUrl.publicUrl;
    }

    const { data, error } = await supabaseAdmin.from('patients').insert([
      {
        ...patient,
        identification_document_url: fileUrl
      },
    ])
    .select()
    .single();

    if(error) throw error;

    return data;
  }catch(error){
    console.error('error registering patient', error);
  }
}