import { spawn } from 'child_process';

export async function handleGetStats(reposToIgnore?: string[] | []) {
    const token = process.env.TOKEN;

    if (!token) {
        throw new Error('Token do GitHub não fornecido.');
    }

    const executablePath = 'src/app/services/scripts/fetchGit.exe';
    
    const args = [token];

    if (reposToIgnore && reposToIgnore.length > 0) {
        args.push('--ignore', ...reposToIgnore);
    }

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

                const jsonLines = output.split('\n').filter(line => {
                    line = line.trim();
                    return line.startsWith('{') && line.endsWith('}');
                });

                if (jsonLines.length === 0) {
                    return reject(new Error('Nenhum JSON válido encontrado na saída'));
                }

                const result = JSON.parse(jsonLines[jsonLines.length - 1]);
                resolve(result);
            } catch (err) {
                reject(new Error(`Erro ao parsear output: ${err}\nOutput: ${output}`));
            }
        });
    });
}