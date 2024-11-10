import requests

def get_chuck_norris_joke():
  response = requests.get('https://api.chucknorris.io/jokes/random')
  if response.status_code == 200:
    joke = response.json()['value']
    print(joke)
  else:
    print("Não foi possível obter a piada.")

get_chuck_norris_joke()