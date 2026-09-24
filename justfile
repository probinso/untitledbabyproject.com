backend:
    cd backend && uv run uvicorn main:app --reload

frontend:
    cd frontend && npm run dev

[parallel]
dev: backend frontend

build:
    cd frontend && npm run build
