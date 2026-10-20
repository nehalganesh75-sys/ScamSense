import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data

def test_analyze_endpoint_high_risk():
    payload = {
        "content": "Please share your banking OTP immediately to verify your account or it will be suspended within 15 minutes.",
        "analysis_type": "message",
        "consent_store": False
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["assessment"] == "high_suspicion"
    assert data["risk_score"] >= 65
    assert len(data["indicators"]) >= 1
    assert "limitations" in data
    assert len(data["recommendations"]) >= 1

def test_inspect_url_endpoint():
    payload = {
        "url": "https://netflix.account-billing-update.top/signin",
        "consent_store": False
    }
    response = client.post("/api/inspect-url", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["assessment"] == "high_suspicion"
    assert "normalized_domain" in data

def test_simulator_scenarios_and_attempt():
    response = client.get("/api/simulator/scenarios")
    assert response.status_code == 200
    scenarios = response.json()
    assert len(scenarios) >= 4
    
    first_scen = scenarios[0]
    first_opt = first_scen["options"][0]
    
    attempt_payload = {
        "selected_option_id": first_opt["id"],
        "session_id": "test_session_123"
    }
    attempt_res = client.post(f"/api/simulator/scenarios/{first_scen['id']}/attempt", json=attempt_payload)
    assert attempt_res.status_code == 200
    attempt_data = attempt_res.json()
    assert "is_correct" in attempt_data
    assert "explanation" in attempt_data

def test_pattern_graph_endpoint():
    response = client.get("/api/patterns/graph")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) > 0

def test_dashboard_summary_endpoint():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_analyses" in data
    assert "risk_distribution" in data
