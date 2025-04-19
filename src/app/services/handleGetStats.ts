import { PythonShell } from 'python-shell' // se estiver usando CommonJS
import 'dotenv/config';

const token = process.env.TOKEN as string

interface PythonOptions {
    args: string[];
}
  

export async function handleGetStats() {


      const options: PythonOptions = { args: [token] };

    const results = await PythonShell.run('src/app/services/scripts/fetchGit.py', options);

    const jsonString = results.find(line => {
        try {
            JSON.parse(line);
            return true;
        } catch {
            return false;
        }
    });

    if (!jsonString) {
        throw new Error('Nenhum JSON válido encontrado na saída do Python');
    }

    const result = JSON.parse(jsonString);
    return result;
}
