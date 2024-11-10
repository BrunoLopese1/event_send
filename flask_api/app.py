from flask import Flask, request, jsonify
import sys
import io
import traceback
import subprocess
import requests
import json

app = Flask(__name__)

def ensure_requests_installed():
    try:
        import requests
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
        import requests 

@app.route('/execute-python', methods=['POST'])
def execute_python():
    import requests
    code = request.json.get('code')

    ensure_requests_installed()
    
    old_stdout = sys.stdout
    new_stdout = io.StringIO()
    sys.stdout = new_stdout

    try:

        exec(code, {'requests': requests})
    except Exception as e:
        sys.stdout = old_stdout
        return jsonify({
            'error': f'Error occurred: {str(e)}',
            'traceback': traceback.format_exc()
        }), 400
    
    sys.stdout = old_stdout
    output = new_stdout.getvalue()
    return jsonify({'output': output})

@app.route('/proxy', methods=['POST'])
def proxy_request():

    data = request.get_json()
    api_url = request.headers.get('url')
    api_key = request.headers.get('x-api-key')

    if not api_url or not api_key:
        return jsonify({'error': 'Missing URL or API key'}), 400

    try:

        response = requests.post(api_url, json=data, headers={"x-api-key": api_key})
        
        if response.status_code == 200:
            return jsonify(response.json()), 200
        else:
            return jsonify({'error': 'Failed to fetch data from external API', 'details': response.text}), 500

    except Exception as e:
        return jsonify({'error': f'Error during API call: {str(e)}'}), 500
    

@app.route('/save_config', methods=['POST'])
def save_config():
    data = request.get_json()
    with open('config.json', 'w') as f:
        json.dump(data, f)
    return jsonify({'message': 'Configurações salvas com sucesso'})

@app.route('/get_config', methods=['GET'])
def get_config():
    with open('config.json', 'r') as f:
        data = json.load(f)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)