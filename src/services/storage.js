/**
 * Uploads an image file to ImgBB and returns its direct HTTPS display URL.
 * 
 * @param {File} file - The image file from the input field
 * @returns {Promise<string>} The public image URL
 */
export async function uploadImage(file) {
  if (!file) return '';

  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;

  if (!apiKey) {
    throw new Error('ImgBB API key is missing. Please check VITE_IMGBB_API_KEY in .env.local');
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      // Returns the direct image URL (e.g., https://i.ibb.co/xxxx/image.jpg)
      return result.data.url;
    } else {
      throw new Error(result.error?.message || 'Failed to upload image to ImgBB');
    }
  } catch (error) {
    console.error('ImgBB Upload Error:', error);
    throw error;
  }
}