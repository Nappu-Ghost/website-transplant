
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app import schemas, models
from app.models import RoleEnum, StatusEnum, ShiftTimeEnum
from datetime import datetime, date, timedelta


def create_prerequisites_for_shift(auth_client: TestClient):
    timestamp = datetime.now().timestamp()
    doc_user_data = {"email": f"doc_shift_{timestamp}@example.com", "password": "password123", "name": "Shift Doctor User", "role": RoleEnum.DOCTOR}
    doc_user_res = auth_client.post("/users/", json=doc_user_data)
    assert doc_user_res.status_code == 201
    doc_user_id = doc_user_res.json()["id"]

    clinic_data = {"name": f"Shift Clinic {timestamp}", "address": "1 Shift St", "opening_hours": "9AM-5PM"}
    clinic_res = auth_client.post("/clinics/", json=clinic_data)
    assert clinic_res.status_code == 201
    clinic_id = clinic_res.json()["id"]

    doctor_data = {"specialty": "Shift Specialist", "clinic_id": clinic_id, "user_id": doc_user_id}
    doc_res = auth_client.post("/doctors/", json=doctor_data)
    assert doc_res.status_code == 201, doc_res.json()
    doctor_id = doc_res.json()["id"]

    return doctor_id, clinic_id

def test_create_shift(auth_client: TestClient, db_session: Session):
    doctor_id, clinic_id = create_prerequisites_for_shift(auth_client)
    shift_date = (date.today() + timedelta(days=1)).isoformat()

    shift_data = {
        "date": shift_date,
        "shift_time": ShiftTimeEnum.MORNING.value,
        "room": "Room A1",
        "doctor_id": doctor_id,
        "clinic_id": clinic_id
    }
    response = auth_client.post("/shifts/", json=shift_data)
    assert response.status_code == 201, response.json()
    data = response.json()
    assert data["date"] == shift_date
    assert data["shift_time"] == ShiftTimeEnum.MORNING.value
    assert data["doctor_id"] == doctor_id
    assert "id" in data

    db_shift = db_session.get(models.Shift, data["id"])
    assert db_shift is not None
    assert db_shift.room == "Room A1"

def test_create_shift_duplicate(auth_client: TestClient):
    doctor_id, clinic_id = create_prerequisites_for_shift(auth_client)
    shift_date = (date.today() + timedelta(days=2)).isoformat()
    shift_data = {
        "date": shift_date, "shift_time": ShiftTimeEnum.AFTERNOON.value,
        "doctor_id": doctor_id, "clinic_id": clinic_id
    }
    response1 = auth_client.post("/shifts/", json=shift_data)
    assert response1.status_code == 201

    response2 = auth_client.post("/shifts/", json=shift_data) 
    assert response2.status_code == 400 
    assert "already exists" in response2.json()["detail"].lower() or "unique constraint failed" in response2.json()["detail"].lower()


def test_read_shifts_empty(auth_client: TestClient):
    # Create a unique timestamp to avoid conflicts with existing data
    timestamp = datetime.now().timestamp()
    response = auth_client.get(f"/shifts/?search={timestamp}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_read_shifts_with_data(auth_client: TestClient):
    doc_id1, clinic_id1 = create_prerequisites_for_shift(auth_client)
    doc_id2, clinic_id2 = create_prerequisites_for_shift(auth_client) 

    auth_client.post("/shifts/", json={"date": (date.today() + timedelta(days=3)).isoformat(), "shift_time": "MORNING", "doctor_id": doc_id1, "clinic_id": clinic_id1})
    auth_client.post("/shifts/", json={"date": (date.today() + timedelta(days=4)).isoformat(), "shift_time": "EVENING", "doctor_id": doc_id2, "clinic_id": clinic_id2})

    response = auth_client.get("/shifts/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2

def test_get_shift_by_id(auth_client: TestClient):
    doctor_id, clinic_id = create_prerequisites_for_shift(auth_client)
    shift_date = (date.today() + timedelta(days=5)).isoformat()
    
    shift_data = {
        "date": shift_date,
        "shift_time": ShiftTimeEnum.EVENING.value,
        "room": "Room B2",
        "doctor_id": doctor_id,
        "clinic_id": clinic_id
    }
    
    create_response = auth_client.post("/shifts/", json=shift_data)
    assert create_response.status_code == 201
    shift_id = create_response.json()["id"]
    
    get_response = auth_client.get(f"/shifts/{shift_id}")
    assert get_response.status_code == 200
    shift = get_response.json()
    assert shift["id"] == shift_id
    assert shift["date"] == shift_date
    assert shift["shift_time"] == ShiftTimeEnum.EVENING.value
    assert shift["room"] == "Room B2"

def test_delete_shift(auth_client: TestClient, db_session: Session):
    doctor_id, clinic_id = create_prerequisites_for_shift(auth_client)
    shift_date = (date.today() + timedelta(days=6)).isoformat()
    
    shift_data = {
        "date": shift_date,
        "shift_time": ShiftTimeEnum.MORNING.value,
        "room": "Room C3",
        "doctor_id": doctor_id,
        "clinic_id": clinic_id
    }
    
    create_response = auth_client.post("/shifts/", json=shift_data)
    assert create_response.status_code == 201
    shift_id = create_response.json()["id"]
    
    delete_response = auth_client.delete(f"/shifts/{shift_id}")
    assert delete_response.status_code in [200, 204]
    
    # Verify the shift no longer exists
    get_response = auth_client.get(f"/shifts/{shift_id}")
    assert get_response.status_code == 404 


