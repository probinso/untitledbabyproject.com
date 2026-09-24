backend:
    cd backend && uv run uvicorn main:app --reload

frontend:
    cd frontend && npm run dev

[parallel]
dev: backend frontend

build:
    cd frontend && npm run build

loadtest:
    cd backend && uv run --with locust locust -f loadtest.py --host http://localhost:8000
