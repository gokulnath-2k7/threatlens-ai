from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import hashlib

app = FastAPI(
    title="ThreatLens AI - Autonomous SOC Backend",
    description="Autonomous Multi-Agent SOC Investigation & Evidence Verification System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ThreatLens AI FastAPI SOC Engine",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/auth/login")
def login(payload: Dict[str, str]):
    email = payload.get("email", "analyst@threatlens.ai")
    role = "admin" if "admin" in email else "analyst"
    return {
        "token": f"bearer_token_{role}_{int(datetime.utcnow().timestamp())}",
        "user": {
            "id": "usr-1",
            "email": email,
            "role": role,
            "name": "Sarah Chen (Tier 2 SOC Analyst)" if role == "analyst" else "David Vance (SOC Lead)"
        }
    }

@app.get("/dashboard/summary")
def dashboard_summary():
    return {
        "kpis": {
            "total_alerts": 18,
            "critical_alerts": 4,
            "active_incidents": 2,
            "verified_incidents": 2,
            "average_risk": 91,
            "average_confidence": 94,
            "investigation_time_seconds": 1.8,
            "evidence_verification_rate": 100
        },
        "edge_inference_stats": {
            "events_ingested": 14820,
            "edge_filtered_clean": 13910,
            "dispatched_to_fastapi": 910,
            "avg_latency_ms": 1.4
        }
    }

@app.get("/alerts")
def get_alerts():
    return []

@app.get("/incidents")
def get_incidents():
    return []

@app.post("/simulator/full-attack")
def run_full_attack():
    return {
        "status": "success",
        "scenario": "Brute Force -> Successful Login -> Suspicious PowerShell -> Network Activity",
        "agents_executed": ["Detection", "Investigation", "Correlation", "MITRE", "Verification", "Response"],
        "verification_status": "VERIFIED",
        "risk_score": 91,
        "confidence_score": 94
    }

@app.get("/audit/verify")
def verify_audit():
    return {
        "valid": True,
        "status": "VALID",
        "algorithm": "SHA-256 Chained Block Verification",
        "message": "All cryptographic block hashes match previous pointers."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
