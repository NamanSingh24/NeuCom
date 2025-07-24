from typing import List, Dict, Optional, Any, BinaryIO
from rag_engine import RAGEngine
from groq_client import GroqClient
from voice_handler import VoiceHandler
import json
import logging
from datetime import datetime
import asyncio
# KG Integration
from Knowledge_Graph.kg_utils import get_neo4j_driver
# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SOPChat:
    def __init__(self, rag_engine: RAGEngine, groq_client: GroqClient, voice_handler: VoiceHandler = None):
        self.rag_engine = rag_engine
        self.groq_client = groq_client
        self.voice_handler = voice_handler
        self.conversation_history = []
        self.current_procedure = None
        self.current_step = 0
        self.procedure_context = {}
        self.user_preferences = {
            "voice_enabled": False,
            "voice_speed": 1.0,
            "auto_advance_steps": False,
            "safety_reminders": True
        }
    
    def set_user_preferences(self, preferences: Dict[str, Any]):
        """Update user preferences"""
        self.user_preferences.update(preferences)
        logger.info(f"Updated user preferences: {preferences}")
    
    def start_procedure(self, procedure_name: str) -> Dict[str, Any]:
        """Start a specific procedure"""
        try:
            # Search for procedure in documents
            procedure_docs = self.rag_engine.search_documents(
                query=f"procedure {procedure_name}",
                n_results=10
            )
            
            if not procedure_docs:
                return {
                    "success": False,
                    "message": f"Procedure '{procedure_name}' not found in uploaded documents.",
                    "suggestions": []
                }
            
            # Extract steps from the procedure
            steps = []
            for doc in procedure_docs:
                if 'steps' in doc['metadata'] and doc['metadata']['steps']:
                    steps.extend(doc['metadata']['steps'])
            
            self.current_procedure = {
                "name": procedure_name,
                "steps": steps,
                "documents": procedure_docs,
                "started_at": datetime.now().isoformat()
            }
            self.current_step = 0
            
            response = {
                "success": True,
                "procedure_name": procedure_name,
                "total_steps": len(steps),
                "current_step": 0,
                "message": f"Started procedure: {procedure_name}. Found {len(steps)} steps.",
                "first_step": steps[0] if steps else "No specific steps found."
            }
            
            if self.user_preferences["voice_enabled"] and self.voice_handler:
                response["audio"] = self._generate_audio_response(response["message"])
            
            return response
            
        except Exception as e:
            logger.error(f"Error starting procedure: {str(e)}")
            return {
                "success": False,
                "message": f"Error starting procedure: {str(e)}",
                "suggestions": []
            }
    
    def next_step(self) -> Dict[str, Any]:
        """Move to the next step in current procedure"""
        if not self.current_procedure:
            return {"success": False, "message": "No active procedure. Please start a procedure first."}
        
        steps = self.current_procedure["steps"]
        if self.current_step >= len(steps) - 1:
            return {
                "success": False,
                "message": "You've reached the end of the procedure.",
                "completed": True
            }
        
        self.current_step += 1
        current_step_text = steps[self.current_step]
        
        response = {
            "success": True,
            "step_number": self.current_step + 1,
            "total_steps": len(steps),
            "step_text": current_step_text,
            "message": f"Step {self.current_step + 1}: {current_step_text}"
        }
        
        if self.user_preferences["voice_enabled"] and self.voice_handler:
            response["audio"] = self._generate_audio_response(response["message"])
        
        return response
    
    def previous_step(self) -> Dict[str, Any]:
        """Move to the previous step in current procedure"""
        if not self.current_procedure:
            return {"success": False, "message": "No active procedure. Please start a procedure first."}
        
        if self.current_step <= 0:
            return {"success": False, "message": "You're already at the first step."}
        
        self.current_step -= 1
        steps = self.current_procedure["steps"]
        current_step_text = steps[self.current_step]
        
        response = {
            "success": True,
            "step_number": self.current_step + 1,
            "total_steps": len(steps),
            "step_text": current_step_text,
            "message": f"Step {self.current_step + 1}: {current_step_text}"
        }
        
        if self.user_preferences["voice_enabled"] and self.voice_handler:
            response["audio"] = self._generate_audio_response(response["message"])
        
        return response
    
    def get_current_step(self) -> Dict[str, Any]:
        """Get information about the current step"""
        if not self.current_procedure:
            return {"success": False, "message": "No active procedure."}
        
        steps = self.current_procedure["steps"]
        if not steps:
            return {"success": False, "message": "No steps found in current procedure."}
        
        current_step_text = steps[self.current_step]
        
        return {
            "success": True,
            "procedure_name": self.current_procedure["name"],
            "step_number": self.current_step + 1,
            "total_steps": len(steps),
            "step_text": current_step_text,
            "is_first_step": self.current_step == 0,
            "is_last_step": self.current_step == len(steps) - 1
        }
    
    def process_query(self, query: str, context_filter: Dict = None) -> Dict[str, Any]:
        """Process user query and return response"""
        try:
            # Add query to conversation history
            self.conversation_history.append({
                "role": "user", 
                "content": query, 
                "timestamp": datetime.now().isoformat()
            })
            
            # Extract intent
            intent_data = self.groq_client.extract_intent(query)
            
            # Handle navigation intents
            if intent_data["intent"] == "navigation":
                nav_result = self._handle_navigation(query)
                if nav_result:
                    return nav_result
            
            # Search for relevant documents
            search_params = {"n_results": 5}
            if context_filter:
                search_params.update(context_filter)
            
            relevant_docs = self.rag_engine.search_documents(query, **search_params)

            # === KG Filtering step ===
            # You may need to import get_neo4j_driver at the top if not already
          
            kg_driver = get_neo4j_driver()
            # If filter_rag_results_with_kg is a method of RAGEngine:
            filtered_docs = self.rag_engine.filter_rag_results_with_kg(relevant_docs, query, kg_driver)
            # If it's a standalone function, use: filtered_docs = filter_rag_results_with_kg(relevant_docs, query, kg_driver)
            # =========================

            # Add current procedure context if active
            if self.current_procedure:
                procedure_context = f"\nCurrent Procedure: {self.current_procedure['name']}\n"
                procedure_context += f"Current Step: {self.current_step + 1} of {len(self.current_procedure['steps'])}\n"
                if self.current_procedure['steps']:
                    procedure_context += f"Step Text: {self.current_procedure['steps'][self.current_step]}\n"
                
                # Add procedure context to the query
                enhanced_query = query + procedure_context
            else:
                enhanced_query = query
            
            # Generate response
            response_data = self.groq_client.generate_response(
                query=enhanced_query,
                context=filtered_docs,  # <--- Use KG-filtered docs here!
                conversation_history=self.conversation_history[-6:]  # Last 6 messages
            )
            
            # Add response to conversation history
            self.conversation_history.append({
                "role": "assistant", 
                "content": response_data["response"], 
                "timestamp": datetime.now().isoformat()
            })
            
            # Prepare response
            response = {
                "response": response_data["response"],
                "intent": intent_data,
                "sources": response_data.get("sources", []),
                "confidence": max([doc['relevance_score'] for doc in relevant_docs]) if relevant_docs else 0,
                "usage": response_data.get("usage", {}),
                "context_used": len(relevant_docs) > 0,
                "current_procedure": self.current_procedure["name"] if self.current_procedure else None
            }
            
            # Add safety information if relevant
            if intent_data["intent"] == "safety_question" or "safety" in query.lower():
                safety_info = self._extract_safety_information(relevant_docs)
                if safety_info:
                    response["safety_information"] = safety_info
            
            # Generate audio response if voice is enabled
            if self.user_preferences["voice_enabled"] and self.voice_handler:
                response["audio"] = self._generate_audio_response(response_data["response"])
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            error_response = {
                "response": f"I apologize, but I encountered an error while processing your request: {str(e)}",
                "intent": {"intent": "error", "confidence": 0},
                "sources": [],
                "confidence": 0,
                "context_used": False, 
                "current_procedure": self.current_procedure["name"] if self.current_procedure else None,
                "error": str(e)
            }
            
            if self.user_preferences["voice_enabled"] and self.voice_handler:
                error_response["audio"] = self._generate_audio_response(error_response["response"])
            
            return error_response
    
    def _handle_navigation(self, query: str) -> Optional[Dict[str, Any]]:
        """Handle navigation commands"""
        query_lower = query.lower()
        
        if any(phrase in query_lower for phrase in ["next step", "continue", "move forward", "proceed"]):
            return self.next_step()
        elif any(phrase in query_lower for phrase in ["previous step", "go back", "move back", "last step"]):
            return self.previous_step()
        elif any(phrase in query_lower for phrase in ["current step", "where am i", "what step"]):
            return self.get_current_step()
        elif any(phrase in query_lower for phrase in ["start procedure", "begin procedure"]):
            # Extract procedure name
            import re
            procedure_match = re.search(r'(?:start|begin)\s+(?:procedure\s+)?([^.!?]+)', query_lower)
            if procedure_match:
                procedure_name = procedure_match.group(1).strip()
                return self.start_procedure(procedure_name)
        
        return None
    
    def _extract_safety_information(self, docs: List[Dict]) -> List[str]:
        """Extract safety information from relevant documents"""
        safety_info = []
        for doc in docs:
            if 'safety_notes' in doc['metadata'] and doc['metadata']['safety_notes']:
                safety_info.extend(doc['metadata']['safety_notes'])
        
        # Remove duplicates while preserving order
        unique_safety_info = []
        for item in safety_info:
            if item not in unique_safety_info:
                unique_safety_info.append(item)
        
        return unique_safety_info
    
    def _generate_audio_response(self, text: str) -> bytes:
        """Generate audio response if voice handler is available"""
        try:
            if self.voice_handler:
                return self.voice_handler.text_to_speech(
                    text, 
                    speed=self.user_preferences.get("voice_speed", 1.0)
                )
            return None
        except Exception as e:
            logger.error(f"Error generating audio response: {str(e)}")
            return None
    
    def process_voice_input(self, audio_file: BinaryIO) -> Dict[str, Any]:
        """Process voice input and return response"""
        try:
            if not self.voice_handler:
                return {"error": "Voice handler not initialized"}
            
            # Convert speech to text
            stt_result = self.voice_handler.speech_to_text(audio_file)
            
            if not stt_result["text"].strip():
                return {
                    "error": "No speech detected",
                    "transcription": "",
                    "confidence": 0
                }
            
            # Process the transcribed text
            response = self.process_query(stt_result["text"])
            
            # Add transcription information
            response["transcription"] = stt_result["text"]
            response["speech_confidence"] = stt_result.get("confidence", 0)
            response["speech_language"] = stt_result.get("language", "unknown")
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing voice input: {str(e)}")
            return {
                "error": f"Voice processing failed: {str(e)}",
                "transcription": "",
                "confidence": 0
            }
    
    def get_conversation_history(self, limit: int = 20) -> List[Dict]:
        """Get conversation history"""
        return self.conversation_history[-limit:] if limit else self.conversation_history
    
    def clear_conversation(self):
        """Clear conversation history"""
        self.conversation_history = []
        logger.info("Conversation history cleared")
    
    def end_procedure(self) -> Dict[str, Any]:
        """End the current procedure"""
        if not self.current_procedure:
            return {"success": False, "message": "No active procedure to end."}
        
        procedure_name = self.current_procedure["name"]
        completed_steps = self.current_step + 1
        total_steps = len(self.current_procedure["steps"])
        
        # Store procedure completion info
        completion_info = {
            "procedure_name": procedure_name,
            "completed_steps": completed_steps,
            "total_steps": total_steps,
            "completion_percentage": (completed_steps / total_steps * 100) if total_steps > 0 else 0,
            "ended_at": datetime.now().isoformat(),
            "started_at": self.current_procedure.get("started_at"),
            "fully_completed": completed_steps >= total_steps
        }
        
        # Reset procedure state
        self.current_procedure = None
        self.current_step = 0
        
        response = {
            "success": True,
            "message": f"Procedure '{procedure_name}' ended. Completed {completed_steps} of {total_steps} steps.",
            "completion_info": completion_info
        }
        
        if self.user_preferences["voice_enabled"] and self.voice_handler:
            response["audio"] = self._generate_audio_response(response["message"])
        
        return response
    
    def get_procedure_status(self) -> Dict[str, Any]:
        """Get current procedure status"""
        if not self.current_procedure:
            return {
                "active": False,
                "message": "No active procedure"
            }
        
        steps = self.current_procedure["steps"]
        return {
            "active": True,
            "procedure_name": self.current_procedure["name"],
            "current_step": self.current_step + 1,
            "total_steps": len(steps),
            "progress_percentage": ((self.current_step + 1) / len(steps) * 100) if steps else 0,
            "started_at": self.current_procedure.get("started_at"),
            "current_step_text": steps[self.current_step] if steps else "",
            "is_first_step": self.current_step == 0,
            "is_last_step": self.current_step == len(steps) - 1 if steps else False
        }
    
    def get_available_procedures(self) -> List[str]:
        """Get list of available procedures from uploaded documents"""
        try:
            # Search for procedure-related documents
            procedure_docs = self.rag_engine.search_documents("procedure", n_results=50)
            
            procedures = set()
            for doc in procedure_docs:
                source = doc['metadata'].get('source', '').lower()
                
                # Extract procedure names from source filenames and content
                if 'procedure' in source or 'sop' in source:
                    # Clean up filename to get procedure name
                    proc_name = source.replace('.pdf', '').replace('.docx', '').replace('.md', '')
                    proc_name = proc_name.replace('procedure', '').replace('sop', '').strip('_- ')
                    if proc_name:
                        procedures.add(proc_name.title())
            
            return sorted(list(procedures))
            
        except Exception as e:
            logger.error(f"Error getting available procedures: {str(e)}")
            return []
