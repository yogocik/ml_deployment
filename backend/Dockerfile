FROM python:3.10-slim

# Add repository code
WORKDIR /usr/app

# Copy requirements into workdir
COPY requirements.txt ./

# Install requirements in the workdir
RUN pip3 install -r requirements.txt

# Copy backend scripts into workdir
COPY main.py ./

# Add models directory into workdir
ADD models ./models

# Expose Server Port
EXPOSE 8000

# Execute the server
CMD ["python3", "main.py"]