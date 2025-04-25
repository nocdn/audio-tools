# FILE: backend/Dockerfile
# use a specific python slim version
FROM python:3.12-slim

# set environment variables
# ensures python output is sent straight to terminal without buffering
ENV PYTHONUNBUFFERED=1
# set the default port, can be overridden at runtime
ENV PORT=5030

# install system dependencies required by the app (ffmpeg and sox)
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg sox \
    # clean up apt cache to keep image small
    && rm -rf /var/lib/apt/lists/*

# set the working directory in the container
WORKDIR /app

# copy just the requirements first to leverage docker cache
COPY requirements.txt .

# install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# copy the application code
COPY app.py .

# expose the port the app runs on
EXPOSE ${PORT}

# command to run the application using gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:${PORT}", "app:app"]