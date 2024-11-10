import subprocess
import json

def get_chuck_norris_joke_with_curl():
    try:
        # Executa o comando curl e captura a saída
        result = subprocess.run(
            ['curl', '-s', '-X', 'GET', 'https://api.chucknorris.io/jokes/random'],
            check=True,
            text=True,
            capture_output=True
        )
        
        # Converte a saída JSON para um dicionário
        joke_data = json.loads(result.stdout)
        joke = joke_data.get('value', 'Não foi possível obter a piada.')
        print(joke)
        
    except subprocess.CalledProcessError as e:
        print("Erro ao executar o comando curl:", e)

get_chuck_norris_joke_with_curl()
