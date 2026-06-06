import os
import json
from typing import TypedDict, List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langgraph.graph import StateGraph, END
from dotenv import load_dotenv

# Import the new Google GenAI SDK
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI(title="Multi-Agent Project Planner Backend (Powered by Gemini)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client (It automatically looks for GEMINI_API_KEY in .env)
if not os.getenv("GEMINI_API_KEY"):
    raise ValueError("Missing GEMINI_API_KEY environment variable.")
client = genai.Client()

# Define the fast, free-tier model we will use
GEMINI_MODEL = "gemini-2.5-flash"

# --- 1. LangGraph State Definition ---
class ProjectState(TypedDict):
    user_idea: str
    requirements: Dict[str, Any]
    architecture: Dict[str, Any]
    timeline: List[Dict[str, Any]]
    current_agent: str

# --- 2. Pydantic Models for API Requests ---
class PlanRequest(BaseModel):
    idea: str

# --- 3. Safety Parsing Helper ---
def clean_and_parse_json(raw_text: str) -> dict:
    text = raw_text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return json.loads(text.strip())

# --- 4. Agent Node Logic (Now using Gemini) ---

def product_manager_node(state: ProjectState) -> Dict[str, Any]:
    prompt = f"""
    You are an expert Product Manager AI Agent. Analyze this raw project idea: "{state['user_idea']}".
    Provide a JSON structure containing exactly:
    1. core_features (a list of key functional strings)
    2. target_audience (a concise string description)
    3. mvp_scope (a list of core objectives for the first release)
    """
    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="application/json" # Forces strict JSON output
            )
        )
        requirements = clean_and_parse_json(response.text)
        return {"requirements": requirements, "current_agent": "System Architect"}
    except Exception as e:
        return {"requirements": {"error": str(e), "core_features": ["Failed to parse"]}, "current_agent": "System Architect"}

def system_architect_node(state: ProjectState) -> Dict[str, Any]:
    prompt = f"""
    You are an elite System Architect AI Agent. Based on these product requirements: {json.dumps(state['requirements'])}
    Provide a JSON structure containing exactly:
    1. frontend_stack (string stack recommendations)
    2. backend_stack (string backend engine recommendation)
    3. database_recommendation (string database type and strategy)
    4. high_level_architecture (a concise text paragraph describing data flow and hosting)
    """
    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="application/json"
            )
        )
        architecture = clean_and_parse_json(response.text)
        return {"architecture": architecture, "current_agent": "DevOps Timeline"}
    except Exception as e:
        return {"architecture": {"error": str(e), "frontend_stack": "N/A"}, "current_agent": "DevOps Timeline"}

def timeline_estimator_node(state: ProjectState) -> Dict[str, Any]:
    prompt = f"""
    You are an expert DevOps and Release Manager Agent. Based on these architectural choices: {json.dumps(state['architecture'])}
    and product goals: {json.dumps(state['requirements'])}
    
    Provide a JSON array of milestones. Each element must be an object containing exactly:
    1. phase (string, e.g., "Phase 1: Foundation")
    2. estimated_days (integer)
    3. deliverables (a list of strings)
    """
    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="application/json"
            )
        )
        timeline = clean_and_parse_json(response.text)
        return {"timeline": timeline, "current_agent": "Completed"}
    except Exception as e:
        return {"timeline": [{"phase": "Error generating timeline", "estimated_days": 0, "deliverables": [str(e)]}], "current_agent": "Completed"}

# --- 5. Building the Graph Compilation ---
workflow = StateGraph(ProjectState)

workflow.add_node("product_manager", product_manager_node)
workflow.add_node("system_architect", system_architect_node)
workflow.add_node("timeline_estimator", timeline_estimator_node)

workflow.set_entry_point("product_manager")
workflow.add_edge("product_manager", "system_architect")
workflow.add_edge("system_architect", "timeline_estimator")
workflow.add_edge("timeline_estimator", END)

agent_orchestrator = workflow.compile()

# --- 6. API Endpoints ---
@app.post("/api/plan")
async def generate_project_plan(payload: PlanRequest):
    if not payload.idea.strip():
        raise HTTPException(status_code=400, detail="Project idea string cannot be empty.")
    
    initial_state: ProjectState = {
        "user_idea": payload.idea,
        "requirements": {},
        "architecture": {},
        "timeline": [],
        "current_agent": "Initialization"
    }
    
    try:
        final_state = agent_orchestrator.invoke(initial_state)
        return final_state
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph Execution Interrupted: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)