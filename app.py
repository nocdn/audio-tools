from flask import Flask, request, jsonify, send_from_directory
import os
import subprocess
import logging

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
    roomSize = request.form.get('room-size', '50')
    damping = request.form.get('damping', '50')
    dryLevel = request.form.get('dry-level', '50')
    wetLevel = request.form.get('wet-level', '50')
    width = request.form.get('width', '100')
    freeze = request.form.get('freeze', '0')
    delay = request.form.get('delay', '0')

    # check if file is allowed
    if '.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS:
        filename = file.filename
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    else:
        logging.error(f'File type not allowed: {file.filename}')
        return jsonify({'error': 'File type not allowed'}), 400

    # Convert and scale parameters for sox reverb
    reverberance = roomSize
    hf_damping = damping
    room_scale = width
    stereo_depth = "100"
    pre_delay = str(float(delay) * 2)
    wet_gain = str((float(wetLevel) / 10) - 5)

    # Build sox command
    sox_command = f'sox "{os.path.join(UPLOAD_FOLDER, filename)}" "{os.path.join(UPLOAD_FOLDER, f"reverb_{filename}")}" reverb {reverberance} {hf_damping} {room_scale} {stereo_depth} {pre_delay} {wet_gain}'
    
    try:
        subprocess.run(sox_command, shell=True, check=True, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as e:
        logging.error(f'Sox command failed: {e.stderr.decode()}')
        return jsonify({'error': 'Audio processing failed'}), 500

    return send_from_directory(UPLOAD_FOLDER, f'reverb_{filename}', as_attachment=True)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7005)