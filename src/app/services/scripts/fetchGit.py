import sys
import asyncio
import aiohttp
from aiohttp import ClientTimeout
import json

# Captura o token como argumento
if len(sys.argv) < 2:
    print("Uso: python fetchGit.py <GITHUB_TOKEN>")
    sys.exit(1)

TOKEN = sys.argv[1]

HEADERS = {
    'Authorization': f'token {TOKEN}',
    'Accept': 'application/vnd.github.v3+json'
}

TIMEOUT = ClientTimeout(total=30)

async def listar_repositorios(session):
    try:
        async with session.get('https://api.github.com/user/repos?per_page=100', headers=HEADERS, timeout=TIMEOUT) as resp:
            data = await resp.json()
            return [repo for repo in data if repo.get('private')]
    except Exception as e:
        print(f"Erro ao listar repositórios: {e}")
        return []

async def obter_linguagens(session, repo):
    try:
        async with session.get(repo['languages_url'], headers=HEADERS, timeout=TIMEOUT) as resp:
            return await resp.json()
    except Exception as e:
        print(f"Erro ao obter linguagens do repositório {repo['name']}: {e}")
        return {}

async def main():
    try:
        async with aiohttp.ClientSession(timeout=TIMEOUT) as session:
            repos = await listar_repositorios(session)
            if not repos:
                print("Nenhum repositório privado encontrado ou erro na requisição.")
                return {}

            linguagens_totais = {}
            tasks = [obter_linguagens(session, repo) for repo in repos]
            resultados = await asyncio.gather(*tasks)

            # Agrega os resultados de todos os repositórios
            for linguagens in resultados:
                for linguagem, bytes_ in linguagens.items():
                    linguagens_totais[linguagem] = linguagens_totais.get(linguagem, 0) + bytes_

            # Calcula o total geral de bytes
            total_bytes = sum(linguagens_totais.values())

            # Prepara o array de linguagens
            langs_array = [
                {"lang": lang, "bytes": bytes_}
                for lang, bytes_ in linguagens_totais.items()
            ]

            # Ordena as linguagens por bytes (decrescente)
            langs_array.sort(key=lambda x: x["bytes"], reverse=True)

            # Cria o objeto final
            resultado_final = {
                "total_bytes": total_bytes,
                "langs": langs_array
            }

            # Imprime o resultado formatado (opcional)
            print(json.dumps(resultado_final, indent=2))

            return resultado_final

    except Exception as e:
        print(f"Erro inesperado: {e}")
        return {}

if __name__ == '__main__':
    resultado = asyncio.run(main())
    print(json.dumps(resultado)) 