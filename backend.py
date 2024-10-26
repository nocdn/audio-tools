from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__)

# Configure file upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'m4a', 'mp3', 'wav'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')


@app.route('/api/upload', methods=['POST'])
def upload_file():
    # Log all form data at the start
    logging.info("Received request with the following parameters:")
    for key in request.form:
        logging.info(f"  {key}: {request.form[key]}")

    if 'file' not in request.files:
        logging.error('No file part in the request')
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        logging.error('No file selected')
        return jsonify({'error': 'No file selected'}), 400

    # Get parameters from request
    reverb = request.form.get('reverb', '30')





if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7005)
