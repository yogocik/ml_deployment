build-backend-dockerfile:
	docker build -t backend_v1 ./backend -f ./backend/Dockerfile

build-tf-serving-dockerfile:
	docker build -t tf_serving_ann ./backend -f ./backend/Dockerfile.tf_serving

run-backend-build:
	docker run -d -p 8000:8000 --name backend_v1_container backend_v1

run-tf-serving-build:
	docker run --rm -d -p 8502:8501 --mount type=bind,source=/Users/yogicrhamadianto/Documents/Programming/ml_deployment/backend/models/,target=/models/ --name tf_serving_ann_container tf_serving_ann --model_config_file=/models/models.config --model_config_file_poll_wait_seconds=0

# Execute this commands after activate python virtual environment (if any)
tensorflowjs_converter_help:
	tensorflowjs_converter --help

# Execute this commands inside backend folder and after activate python virtual environment (if any)
tensorflowjs_convert_model:
	tensorflowjs_converter --input_format=tf_saved_model --output_format=tfjs_graph_model models/ann/1 ../frontend/src/models/ann_js

manual_tensorflow_serving_server:
	tensorflow_model_server --rest_api_port 8501 --model_config_file=/models/models.config