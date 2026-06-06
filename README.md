# Multi-Agent Project Planner 🚀
*Orvantia AI Engineering Technical Challenge*

**Developed by:** Sri Harsha Sorra

## 📌 Overview
The Multi-Agent Project Planner is a full-stack application designed to autonomously scope, architect, and plan software projects. By leveraging a multi-agent backend, the system orchestrates a workflow between specialized AI personas (Product Manager, System Architect, and DevOps) to transform a raw project idea into a structured execution roadmap and system design. 

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Frontend ["Frontend (Next.js)"]
        UI_In[User Input: Project Idea]
        UI_Out[Dashboard: Tabs & Cards]
    end

    subgraph Backend ["Backend (Python)"]
        API[API Endpoint]
        State[(LangGraph State)]
        
        subgraph Agents ["Agent Workflow (Gemini - strict JSON)"]
            PM[1. Product Manager Agent<br/>Requirements & Scoping]
            SA[2. System Architect Agent<br/>Tech Stack & DB Design]
            DO[3. DevOps Timeline Agent<br/>Execution Roadmap]
        end
    end

    UI_In -->|POST /generate| API
    API -->|Initialize Project State| State
    State --> PM
    PM -->|Update State| SA
    SA -->|Update State| DO
    DO -->|Final JSON Payload| API
    API -->|Return Structured Data| UI_Out

    classDef frontend fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef backend fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef agent fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff;
    
    class UI_In,UI_Out frontend;
    class API,State backend;
    class PM,SA,DO agent;
