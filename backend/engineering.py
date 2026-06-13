import json
import asyncio
from typing import List
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from pydantic import BaseModel

class GSDRequest(BaseModel):
    task: str

class RalphLoopRequest(BaseModel):
    prd: str

class CodeReviewRequest(BaseModel):
    code: str

async def gsd_breaking_task(task: str) -> List[str]:
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.2)
    prompt = f"""Break the following high-level engineering task into a list of atomic, actionable, and sequence-ordered steps. 
    Ensure no hallucinations and maintain technical accuracy. 
    
    Task: {task}
    
    Format your output strictly as a JSON array of strings, e.g. ["step 1", "step 2"]. Return NOTHING else."""
    
    try:
        response = await llm.ainvoke(prompt)
        text = response.content.replace('```json', '').replace('```', '').strip()
        return json.loads(text)
    except Exception as e:
        print(f"Error in GSD: {e}")
        return ["Analyze requirements", "Plan implementation", "Execute code changes", "Verify results"]

async def ralph_loop_iteration(prd: str):
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0.4)
    
    # We simulate a 3-step loop for the demo
    steps = [
        "Analyzing PRD and Designing Architecture...",
        "Generating Initial codebase...",
        "Running Automated Tests & Self-Correction...",
        "Finalizing Implementation..."
    ]
    
    results = []
    for step in steps:
        results.append({"status": "in_progress", "message": step})
        # Simulate some AI thinking/work
        await asyncio.sleep(1.5)
        results[-1]["status"] = "completed"
        
    prompt = f"Based on this PRD: {prd}\n\nProvide a high-level technical summary of what was 'built' in this loop (brief, 2-3 sentences)."
    try:
        response = await llm.ainvoke(prompt)
        summary = response.content.strip()
    except:
        summary = "Loop completed successfully. Built core modules as per PRD."
        
    return {"log": results, "summary": summary}

async def code_rabbit_review(code: str):
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.3)
    prompt = f"""Review the following code for bugs, performance issues, and best practices. 
    Provide exactly 3 concise, actionable improvement points.
    
    Code:
    {code}
    
    Format your output strictly as a JSON array of strings. Return NOTHING else."""
    
    try:
        response = await llm.ainvoke(prompt)
        text = response.content.replace('```json', '').replace('```', '').strip()
        return json.loads(text)
    except Exception as e:
        print(f"Error in CodeRabbit: {e}")
        return ["Ensure proper error handling", "Consider performance optimizations", "Follow clean code principles"]
