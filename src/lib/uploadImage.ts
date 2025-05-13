import { supabase } from './supabase';

export async function uploadImage(file: File, bucket: string = 'images'): Promise<string | null> {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error('Failed to get public URL');
    }

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}