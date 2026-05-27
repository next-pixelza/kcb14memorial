export default async function handler(req, res) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {

        const { amount, productName } = req.body;

        const response = await fetch('https://payments.yoco.com/api/checkouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.YOCO_SECRET_KEY}`
            },
            body: JSON.stringify({
                amount,
                currency: 'ZAR',
                successUrl: 'https://YOUR-VERCEL-URL.vercel.app/success.html',
                cancelUrl: 'https://YOUR-VERCEL-URL.vercel.app/cancel.html',
                metadata: {
                    productName
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(400).json({
                error: 'Yoco error',
                details: data
            });
        }

        return res.status(200).json({
            redirectUrl: data.redirectUrl
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
}
