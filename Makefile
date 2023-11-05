build-backend-dockerfile:
	docker build -t backend_v1 ./backend -f ./backend/Dockerfile
run-backend-build:
	docker run -d -p 8000:8000 --name backend_v1_container backend_v1
