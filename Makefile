build-backend-dockerfile:
	docker build -t backend_v1 ./backend -f ./backend/Dockerfile

build-tf-serving-dockerfile:
	docker build -t tf_serving_ann ./backend -f ./backend/Dockerfile.tf_serving

run-backend-build:
	docker run -d -p 8000:8000 --name backend_v1_container backend_v1

run-tf-serving-build:
	docker run -d -p 8502:8501 -v "./backend/models/ann:/models/ann" -e MODEL_NAME=ann --name tf_serving_ann_container tf_serving_ann

# Execute this commands after activate python virtual environment (if any)
tensorflowjs_converter_help:
	tensorflowjs_converter --help

# Execute this commands inside backend folder and after activate python virtual environment (if any)
tensorflowjs_convert_model:
	tensorflowjs_converter --input_format=tf_saved_model --output_format=tfjs_graph_model models/ann/1 ../frontend/src/models/ann_js