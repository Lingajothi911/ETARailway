import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestRailPredictBackend(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_root_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["project"], "RailPredict")

    def test_train_search(self):
        response = self.client.get("/api/trains/search?q=12627")
        self.assertEqual(response.status_code, 200)
        trains = response.json()
        self.assertTrue(len(trains) > 0)
        self.assertEqual(trains[0]["train_number"], "12627")
        self.assertIn("Karnataka Express", trains[0]["train_name"])

    def test_train_details_and_dynamic_eta(self):
        response = self.client.get("/api/trains/12627")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["train_number"], "12627")
        self.assertIsNotNone(data["live_state"])
        self.assertTrue(len(data["schedules"]) >= 6)
        self.assertTrue(len(data["coaches"]) >= 8)
        self.assertIsNotNone(data["next_station_prediction"])
        pred = data["next_station_prediction"]
        self.assertEqual(pred["prediction_source"], "simulation")
        self.assertIn("factors", pred)
        self.assertTrue(len(pred["factors"]) > 0)

    def test_officer_dashboard(self):
        response = self.client.get("/api/officer/dashboard")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("kpis", data)
        self.assertIn("trains", data)
        self.assertIn("conflicts", data)
        self.assertIn("congestion", data)
        self.assertIn("alerts", data)
        self.assertTrue(data["kpis"]["active_trains"] > 0)

    def test_platform_conflicts(self):
        response = self.client.get("/api/officer/conflicts")
        self.assertEqual(response.status_code, 200)
        conflicts = response.json()
        self.assertTrue(len(conflicts) > 0)
        self.assertEqual(conflicts[0]["station_code"], "KPD")

    def test_simulation_controls(self):
        res_status = self.client.get("/api/simulation/status")
        self.assertEqual(res_status.status_code, 200)

        res_speed = self.client.post("/api/simulation/speed?speed=15")
        self.assertEqual(res_speed.status_code, 200)
        self.assertEqual(res_speed.json()["speed_multiplier"], 15)

        res_inject = self.client.post("/api/simulation/inject_delay", json={
            "action": "inject_delay",
            "train_number": "12627",
            "added_delay_minutes": 10
        })
        self.assertEqual(res_inject.status_code, 200)
        self.assertTrue(res_inject.json()["success"])

    def test_analytics(self):
        response = self.client.get("/api/officer/analytics")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("summary", data)
        self.assertIn("evaluations", data)
        self.assertTrue(data["summary"]["mae_ml_minutes"] < data["summary"]["mae_traditional_minutes"])

if __name__ == "__main__":
    unittest.main()
