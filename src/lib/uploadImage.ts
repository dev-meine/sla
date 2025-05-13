import { supabase } from './supabase';

export async function uploadImage(file: File, bucket: string = 'images'): Promise<string | null> {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.');
    }

    // Validate file size (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    // Generate unique filename with original extension
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${timestamp}-${randomString}.${fileExt}`;

    // Upload file
    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    if (!data?.path) {
      throw new Error('Upload successful but no path returned');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    if (!publicUrl) {
      throw new Error('Failed to get public URL');
    }

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}