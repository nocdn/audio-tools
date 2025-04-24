import os
import json
import mimetypes
import subprocess
import tempfile
import logging
from pathlib import Path

from flask import Flask, request, send_file, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
from flask_cors import CORS

# --- logging ---
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
log = logging.getLogger("audio-tools")

# --- env / limits ---
load_dotenv()
MAIN_RATE_LIMIT = os.getenv("MAIN_RATE_LIMIT", "100 per day")
OTHER_RATE_LIMIT = os.getenv("OTHER_RATE_LIMIT", "500 per day")

# --- flask setup ---
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
limiter = Limiter(get_remote_address, app=app, default_limits=[OTHER_RATE_LIMIT], storage_uri="memory://")

# --- helpers ---------------------------------------------------------------
def build_sox_args(bass: dict, reverb: dict) -> list[str]:
    # convert bass+reverb dicts to sox arg list in correct order
    wet_gain = max(-10, min(10, reverb.get("wetGain", 0)))     # clamp -10…10
    return [
        "bass",
        str(bass.get("gain", 0)),
        str(bass.get("frequency", 100)),
        str(bass.get("width", 0.5)),
        "reverb",
        str(reverb.get("reverberance", 50)),
        str(reverb.get("hfDamping", 50)),
        str(reverb.get("roomScale", 100)),
        str(reverb.get("stereoDepth", 100)),
        str(reverb.get("preDelay", 0)),
        str(wet_gain),
    ]


def run_cmd(cmd: list[str], err_msg: str):
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"{err_msg}: {res.stderr.strip()}")


def convert_m4a_to_wav(src: Path, dst: Path):
    run_cmd(["ffmpeg", "-y", "-i", str(src), str(dst)], "ffmpeg conversion failed")


def run_sox(in_path: Path, out_path: Path, bass: dict, reverb: dict):
    cmd = ["sox", str(in_path), str(out_path)] + build_sox_args(bass, reverb)
    run_cmd(cmd, "sox failed")


@app.get("/api/health")
@limiter.limit(OTHER_RATE_LIMIT)
def health():
    return jsonify(status="ok")


@app.post("/api/process")
@limiter.limit(MAIN_RATE_LIMIT)
def process_audio():
    log.info("new /api/process request")
    uploaded = request.files.get("file")
    if uploaded is None:
        return jsonify(error="file field missing"), 400

    # parse settings
    try:
        bass = json.loads(request.form.get("bass", "{}"))
        reverb = json.loads(request.form.get("reverb", "{}"))
    except json.JSONDecodeError:
        return jsonify(error="invalid settings json"), 400

    in_name = Path(uploaded.filename)
    stem, suffix = in_name.stem, in_name.suffix.lower()

    with tempfile.TemporaryDirectory() as tdir:
        tdir = Path(tdir)

        # save original upload
        src_path = tdir / in_name.name
        uploaded.save(src_path)

        # decide processing input + desired output ext
        if suffix == ".m4a":
            # convert to wav for sox, keep final output as wav
            sox_input = tdir / f"{stem}.wav"
            try:
                log.info("converting m4a → wav via ffmpeg")
                convert_m4a_to_wav(src_path, sox_input)
            except RuntimeError as e:
                log.error(e)
                return jsonify(error=str(e)), 500
            output_ext = ".wav"
        else:
            # sox can read the file directly
            sox_input = src_path
            output_ext = suffix

        out_path = tdir / f"{stem}_modified{output_ext}"

        # run sox
        try:
            log.info("running sox")
            run_sox(sox_input, out_path, bass, reverb)
        except RuntimeError as e:
            log.error(e)
            return jsonify(error=str(e)), 500

        # respond
        mime = mimetypes.guess_type(out_path.name)[0] or "application/octet-stream"
        log.info("sending processed file")
        return send_file(out_path, mimetype=mime, as_attachment=True, download_name=out_path.name)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5030))
    log.info(f"starting flask on 0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)