import { handleGetStats } from '@/app/services/handleGetStats';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const ignore = req.query.ignore;

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const ignoreArray = typeof ignore === 'string'
            ? ignore.split(',').map(s => s.trim()).filter(Boolean)
            : Array.isArray(ignore)
                ? ignore.flatMap(item => item.split(',').map(s => s.trim()))
                : [];

        const stats = await handleGetStats(ignoreArray);

        if (!stats) {
            return res.status(404).json({ error: 'Item não encontrado' });
        }

        return res.status(200).json(stats);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao buscar item' });
    }
}
