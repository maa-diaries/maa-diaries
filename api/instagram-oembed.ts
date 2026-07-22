import { rateLimit } from './_rateLimit';

export default async function handler(req: any, res: any) {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  const { allowed } = await rateLimit(`ig-oembed:${ip}`, 30, 60000);
  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const allowedOrigin = process.env.ALLOWED_ORIGIN || process.env.BASE_URL || 'http://localhost:5173';
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid url parameter' });
  }

  const instagramUrlPattern = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[\w-]+/;
  if (!instagramUrlPattern.test(url)) {
    return res.status(400).json({ error: 'Invalid Instagram URL. Must be a post, reel, or TV link.' });
  }

  try {
    const oembedUrl = `https://graph.facebook.com/v25.0/instagram_oembed?url=${encodeURIComponent(url)}&fields=html,thumbnail_url,title,type`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      const errBody = await response.text();
      console.warn(`Instagram oEmbed failed (${response.status}):`, errBody);
      return res.status(502).json({ error: 'Failed to fetch Instagram embed data. The post may be private or unavailable.' });
    }

    const data = await response.json();

    let postType: 'post' | 'reel' | 'unknown' = 'unknown';
    if (url.includes('/reel/')) postType = 'reel';
    else if (url.includes('/p/')) postType = 'post';
    else if (url.includes('/tv/')) postType = 'post';

    return res.status(200).json({
      html: data.html,
      thumbnail: data.thumbnail_url,
      title: data.title || '',
      type: postType
    });
  } catch (err) {
    console.error('Instagram oEmbed proxy error:', err);
    return res.status(500).json({ error: 'Internal server error fetching Instagram data.' });
  }
}
