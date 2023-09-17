from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/greeting', methods=['POST'])
def handle_greeting():
    try:
        uploaded_files = request.files.getlist('file')

        for file in uploaded_files:
            file.save(f'uploads/{file.filename}')

        return "Files uploaded successfully", 200
    except Exception as e:
        return str(e), 400

if __name__ == '__main__':
    app.run(debug=True)
