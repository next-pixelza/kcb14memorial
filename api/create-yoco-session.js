export default async function handler(req, res) {
    // Enable CORS so your frontend pages can talk to this backend function safely
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle browser pre-flight safety checks
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow secure POST requests from your forms
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { amountInCents, customerName, customerEmail, itemsOrdered } = req.body;

        // Make the secure, hidden server-to-server call to Yoco's API
        const response = await fetch('https://online.yoco.com/v1/charges/tokens', {
            method: 'POST',
            headers: {
                'X-Auth-Secret-Key': process.env.YOCO_SECRET_KEY, // Pulls safely from your hidden Vercel settings
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amountInCents: amountInCents,
                currency: 'ZAR',
                metadata: {
                    name: customerName,
                    email: customerEmail,
                    order: itemsOrdered
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(400).json({ error: 'Yoco API Error', details: data });
        }

        // Return the temporary payment session token back to your frontend page
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: 'Server Error', message: error.message });
    }
}
