import os
import json
import mimetypes
import subprocess
import tempfile
from pathlib import Path

from flask import Flask, request, send_file, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

# --- env & rate‑limit setup ---
load_dotenv()  # read .env if it exists

MAIN_RATE_LIMIT = os.getenv("MAIN_RATE_LIMIT", "100 per day")
OTHER_RATE_LIMIT = os.getenv("OTHER_RATE_LIMIT", "500 per day")

app = Flask(__name__)
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=[OTHER_RATE_LIMIT],
    storage_uri="memory://",
)


def build_sox_args(bass: dict, reverb: dict) -> list[str]:
    """convert bass+reverb dicts to sox arg list"""
    bass_args = [
        "bass",
        str(bass.get("gain", 0)),
        str(bass.get("frequency", 100)),
        str(bass.get("width", 0.5)),
    ]

    reverb_args = [
        "reverb",
        str(reverb.get("wetGain", 0)),
        str(reverb.get("reverberance", 50)),
        str(reverb.get("hfDamping", 50)),
        str(reverb.get("roomScale", 100)),
        str(reverb.get("stereoDepth", 100)),
        str(reverb.get("preDelay", 20)),
    ]
    return bass_args + reverb_args


def run_sox(in_path: Path, out_path: Path, bass: dict, reverb: dict) -> None:
    """run sox and raise on error"""
    cmd = ["sox", str(in_path), str(out_path)] + build_sox_args(bass, reverb)
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(res.stderr.strip())



@app.get("/health")
@limiter.limit(OTHER_RATE_LIMIT)
def health():
    return jsonify(status="ok")


@app.post("/process")
@limiter.limit(MAIN_RATE_LIMIT)
def process_audio():
    uploaded = request.files.get("file")
    if uploaded is None:
        return jsonify(error="file field missing"), 400

    try:
        bass = json.loads(request.form.get("bass", "{}"))
        reverb = json.loads(request.form.get("reverb", "{}"))
    except json.JSONDecodeError:
        return jsonify(error="invalid settings json"), 400

    # build output filename with _modified before ext
    in_name = Path(uploaded.filename)
    stem, suffix = in_name.stem, in_name.suffix  # suffix includes leading dot
    out_filename = f"{stem}_modified{suffix}"

    with tempfile.TemporaryDirectory() as tmpdir:
        in_path = Path(tmpdir) / in_name.name
        out_path = Path(tmpdir) / out_filename
        uploaded.save(in_path)

        try:
            run_sox(in_path, out_path, bass, reverb)
        except RuntimeError as e:
            return jsonify(error=f"sox failed: {e}"), 500

        mime = mimetypes.guess_type(out_path.name)[0] or "application/octet-stream"
        return send_file(
            out_path,
            mimetype=mime,
            as_attachment=True,
            download_name=out_path.name,
        )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5030)), debug=True)