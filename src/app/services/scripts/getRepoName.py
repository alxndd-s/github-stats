import sys
import asyncio
import aiohttp
from aiohttp import ClientTimeout
import json

# Verificação de argumentos
if len(sys.argv) < 2:
    print("Uso: python fetchRepoNames.py <GITHUB_TOKEN> [--ignore repo1 repo2 ...]")
    sys.exit(1)

TOKEN = sys.argv[1]
IGNORE_REPOS = []

if '--ignore' in sys.argv:
    ignore_index = sys.argv.index('--ignore')
    IGNORE_REPOS = sys.argv[ignore_index + 1:]

HEADERS = {
    'Authorization': f'token {TOKEN}',
    'Accept': 'application/vnd.github.v3+json'
}

TIMEOUT = ClientTimeout(total=30)

async def listar_nomes_repositorios(session):
    try:
        nomes = []
        page = 1
        while True:
            async with session.get(f'https://api.github.com/user/repos?per_page=100&page={page}', 
                                   headers=HEADERS, timeout=TIMEOUT) as resp:
                data = await resp.json()
                if not data:
                    break
                nomes.extend([repo['name'] for repo in data if repo['name'] not in IGNORE_REPOS])
                page += 1
        return nomes
    except Exception as e:
        print(f"Erro ao listar repositórios: {e}")
        return []

async def main():
    async with aiohttp.ClientSession(timeout=TIMEOUT) as session:
        nomes = await listar_nomes_repositorios(session)
        print(json.dumps(nomes, indent=2))
        return nomes

if __name__ == '__main__':
    asyncio.run(main())
