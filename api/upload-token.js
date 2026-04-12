import { handleUpload } from '@vercel/blob/client';

export default async function handler(request, response) {
  const body = request.body;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // You can put authentication logic here
        // E.g., verifying a user's JWT from Supabase to ensure they are an admin

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          // Provide metadata about who uploaded this
          tokenPayload: JSON.stringify({
            userId: 'admin'
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Here you can do side-effects after the upload finishes
        // E.g., optionally insert a new row in Supabase containing logic mapping `blob.url`
        console.log("Blob upload completed:", blob.url);
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (error) {
    console.error("Vercel Blob failed to generate token", error);
    return response.status(400).json({ error: error.message });
  }
}
