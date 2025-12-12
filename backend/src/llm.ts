import axios from 'axios';


export default async function generateSEODescription(product: {
    name: string;
    description: string;
    unit_price: number;
    weight: number;
    category: string;
}) {
    const prompt = 'Create an SEO-friendly product description in HTML format. DO NOT USE BACKTICKS, PRINT RAW HTML CODE' +
        'The description should be marketing-friendly, unique, and optimized for search engines. ' +
        'Include all product details. DO NOT INCLUDE ANY HYPERLINKS AND IMAGES' +
        'Product: ' +
        `Name: ${product.name}\n` +
        `Description: ${product.description}\n` +
        `Price: ${product.unit_price} PLN\n` +
        `Weight: ${product.weight} kg\n` +
        `Category: ${product.category}\n` +
        'Return ONLY a valid HTML PAGE.';

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'openai/gpt-oss-20b',
        messages: [
            {role: 'user', content: prompt},
            { role: 'system', content: 'You are a expert assistant that creates SEO-friendly product descriptions in HTML format.' }
        ],
    },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.GROQ_KEY}`,
            }
        });

    return response.data.choices[0].message.content;
}