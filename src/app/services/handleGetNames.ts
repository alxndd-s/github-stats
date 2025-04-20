import { spawn } from 'child_process';

export async function handleGetNames() {
    
    const token = process.env.TOKEN;

    if (!token) {
        throw new Error('Token do GitHub não fornecido.');
    }

    const executablePath = 'src/app/services/scripts/getRepoName.exe';
    const args = [token];

    return new Promise((resolve, reject) => {

        const process = spawn(executablePath, args);

        let output = '';
        let errorOutput = '';

        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        process.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        process.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Processo finalizado com código ${code}: ${errorOutput}`));
            }

            try {
                const repoNames = JSON.parse(output);
                resolve(repoNames);
            } catch (err) {
                reject(new Error(`Erro ao parsear output: ${err}\nOutput: ${output}`));
            }
        });
    });
}
