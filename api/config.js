import { createClient } from '@vercel/edge-config';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const configClient = createClient(process.env.EDGE_CONFIG);
    // You can fetch a specific key like 'maintenance_mode' or grab everything.
    // For this example, fetching a boolean flag:
    const maintenanceMode = await configClient.get('maintenance_mode');
    const promotionalBanner = await configClient.get('promo_banner');

    res.status(200).json({
      maintenance_mode: maintenanceMode || false,
      promo_banner: promotionalBanner || null,
    });
  } catch (error) {
    console.error("Error fetching Edge Config:", error);
    res.status(500).json({ error: error.message });
  }
}
