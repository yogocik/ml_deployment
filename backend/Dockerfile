FROM python:3.10-slim

# Add repository code
WORKDIR /usr/app

# Copy requirements into workdir
COPY main.py models requirements.txt ./

# Install requirements in the workdir
RUN pip3 install -r requirements.txt

# Expose Server Port
EXPOSE 8000

# Run the server
RUN python3 main.py