
import { handleGetStats } from '@/app/services/handleGetStats';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {

        const stats = await handleGetStats()
        if (!stats) {
            return res.status(404).json({ error: 'Item não encontrado' });
        }

        return res.status(200).json(stats);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao buscar item' });
    }
}
