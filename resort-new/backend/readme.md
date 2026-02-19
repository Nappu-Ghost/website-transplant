# Resort API

A FastAPI-based API for Azure Lagoon Resort operations. This includes managing users, hotels, rooms, activities, bookings, payments, and ferry schedules.

## Core Features

- User authentication and profile management.
- Hotels, rooms, activities, events, and ferry schedules CRUD.
- Bookings and payment tracking.
- Automatic API documentation via Swagger UI (`/docs`) and ReDoc (`/redoc`).
- Health check endpoint (`/api/v1/health`).

## Tech Stack

- **FastAPI:** Web framework
- **Python 3.10+**
- **SQLAlchemy:** ORM
- **Pydantic:** Data validation
- **Uvicorn:** ASGI server
- **Pytest:** Testing
- **Passlib & bcrypt:** Password hashing

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd resort-new/backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

To start the development server:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8001`.
- Swagger UI: `http://127.0.0.1:8001/docs`
- ReDoc: `http://127.0.0.1:8001/redoc`
- Health Check: `http://127.0.0.1:8001/api/v1/health`

All API endpoints are prefixed with `/api/v1`.

## Seeding Sample Data

To seed resort demo data, run:

```bash
python seed_resort_data.py
```

## Running Tests (Pytest)

Ensure `pytest`, `httpx`, and `pytest-dotenv` (if using `.env` for tests via `pytest.ini`) are installed.

From the project root:

```bash
pytest
```

Or for verbose output:

```bash
pytest -v
```

The `TestClient` fixture in `tests/conftest.py` is configured with `base_url="http://testserver/api/v1"`. Test requests should use relative paths.

## Manual API Testing

While the `uvicorn` server (FastAPI backend) is running on `http://localhost:8001`:

- **Using the `index.html` API Tester:**
  - The project includes an `index.html` file that provides a user interface for testing CRUD operations against your API.
  - To use it, navigate to your project's root directory in the terminal and serve the `index.html` file using Python's built-in HTTP server:
    ```bash
    python -m http.server 8080
    ```
  - Then, open your web browser and go to `http://localhost:8080`.
  - Ensure the "API Base URL" field in the `index.html` page is set to your running FastAPI server (e.g., `http://localhost:8001/api/v1`).

- **API Clients (Postman, Insomnia)**: Use these tools to send requests to endpoints like `http://localhost:8001/api/v1/hotels/`.
- **`curl`**:
  ```bash
  # Example: Get all hotels
  curl http://localhost:8001/api/v1/hotels/

  # Example: Create a hotel
  curl -X POST -H "Content-Type: application/json" \
  -d '{"name": "Lagoon Suites", "location": "Oceanfront Wing"}' \
  http://localhost:8001/api/v1/hotels/
  ```

## Troubleshooting Common Test Failures

- **`405 Method Not Allowed` / `422 Unprocessable Entity`**:
  - Verify the `API_PREFIX="/api/v1"` is correctly applied in `app/main.py` and router definitions.
  - Ensure the `TestClient` in `tests/conftest.py` uses the `base_url="http://localhost:8001/api/v1"`.
  - Double-check specific endpoint paths and HTTP methods in your tests and router definitions.
- **Password Validation Errors (e.g., for `/users/`):** Ensure test data meets Pydantic schema validation rules (e.g., minimum password length).
- **`passlib` / `bcrypt` warnings:** Reinstall with `pip uninstall bcrypt py-bcrypt && pip install bcrypt passlib[bcrypt]`.
- **SQLAlchemy `LegacyAPIWarning` (`Query.get()`):** Update `db_session.query(Model).get(id)` to `db_session.get(Model, id)`.
