/**
 * Uploads a file to Cloudinary.
 * * @param file The file to upload (image or video).
 * @returns The secure URL of the uploaded file.
 * @throws Will throw an error if the upload fails.
 */

export const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!uploadPreset) {
        const msg = 'Cloudinary upload preset is not configured. Set NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your environment (.env.local for local development or in your hosting provider).';
        console.error(msg);
        throw new Error(msg);
    }
    formData.append('upload_preset', uploadPreset);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
        const msg = 'Cloudinary cloud name is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your environment (.env.local for local development or in your hosting provider).';
        console.error(msg);
        throw new Error(msg);
    }

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${file.type.startsWith('video/') ? 'video' : 'image'}/upload`;

    try {
        const response = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Cloudinary upload error response:', errorData);
            throw new Error(errorData?.error?.message || 'Cloudinary upload failed.');
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        throw error;
    }
};
