from groq import Groq
import os
from typing import List, Dict, Optional, Any
import logging
import json
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GroqClient:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv('GROQ_API_KEY')
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is required")
        
        self.client = Groq(api_key=self.api_key)
        self.model = os.getenv('LLM_MODEL', 'llama3-8b-8192')
        self.max_tokens = int(os.getenv('MAX_TOKENS', 1000))
        self.temperature = float(os.getenv('TEMPERATURE', 0.3))
        
        logger.info(f"GroqClient initialized with model: {self.model}")
    
    def generate_response(self, 
                        query: str, 
                        context: List[Dict], 
                        conversation_history: List[Dict] = None,
                        system_prompt: str = None) -> Dict[str, Any]:
        """Generate response using RAG context"""
        
        try:
            # Build context from retrieved documents
            context_text = self._format_context(context)
            
            # Use custom system prompt or default
            system_message = system_prompt or self._get_system_prompt()
            
            # Build conversation history
            messages = [{"role": "system", "content": system_message}]
            
            # Add conversation history (last 6 messages to stay within token limits)
            if conversation_history:
                # Filter out any extra fields like 'timestamp' that Groq API doesn't support
                filtered_history = []
                for msg in conversation_history[-6:]:
                    filtered_history.append({
                        "role": msg["role"],
                        "content": msg["content"]
                    })
                messages.extend(filtered_history)
            
            # Add current query with context
            user_message = self._build_user_message(query, context_text)
            messages.append({"role": "user", "content": user_message})
            
            # Generate response
            response = self.client.chat.completions.create(
                messages=messages,
                model=self.model,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                top_p=1,
                stream=False
            )
            
            response_text = response.choices[0].message.content
            
            # Extract usage information
            usage_info = {
                "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                "total_tokens": response.usage.total_tokens if response.usage else 0
            }
            
            logger.info(f"Generated response for query: {query[:50]}... (Tokens: {usage_info['total_tokens']})")
            
            return {
                "response": response_text,
                "usage": usage_info,
                "model": self.model,
                "context_used": len(context) > 0,
                "sources": [doc['metadata']['source'] for doc in context] if context else []
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return {
                "response": f"I apologize, but I encountered an error while processing your request: {str(e)}",
                "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
                "model": self.model,
                "context_used": False,
                "sources": [],
                "error": str(e)
            }
    
    def _format_context(self, context: List[Dict]) -> str:
        """Format context documents for the prompt"""
        if not context:
            return "No relevant context found."
        
        formatted_context = []
        for i, doc in enumerate(context, 1):
            source = doc['metadata'].get('source', 'Unknown')
            chunk_id = doc['metadata'].get('chunk_id', 'N/A')
            relevance = doc.get('relevance_score', 0)
            
            formatted_context.append(
                f"[Document {i}] Source: {source} (Chunk {chunk_id}, Relevance: {relevance:.2f})\n"
                f"{doc['text']}\n"
            )
        
        return "\n".join(formatted_context)
    
    def _build_user_message(self, query: str, context_text: str) -> str:
        """Build the user message with context"""
        return f"""Context from SOP documents:
{context_text}

User Query: {query}

Please provide a helpful and accurate response based on the SOP context above. If the query is about a specific step or procedure, explain it clearly and mention any safety considerations. If the information is not available in the context, please state that clearly."""
    
    def _get_system_prompt(self) -> str:
        """Get system prompt for SOP assistant"""
        return """You are an expert SOP (Standard Operating Procedure) assistant. Your role is to:

1. Help users understand and follow SOP procedures step by step
2. Provide clear, safety-focused explanations based on the provided context
3. Answer questions about specific steps or procedures accurately
4. Maintain a professional but approachable tone
5. Always prioritize safety and accuracy over speed

Guidelines:
- Use ONLY the provided context to answer questions
- If asked about a step, explain it clearly with timing and safety considerations
- Highlight any safety warnings, cautions, or critical points
- If information is not in the context, clearly state "I don't have that information in the provided documents"
- Keep responses concise but comprehensive
- Use bullet points or numbered lists for multi-step explanations
- Include relevant document sources when citing information
- If multiple documents provide conflicting information, mention this discrepancy

Remember: Safety is paramount. Never guess or improvise safety-critical information."""
    
    def extract_intent(self, query: str) -> Dict[str, Any]:
        """Extract intent from user query"""
        intent_prompt = f"""Analyze this user query and determine the intent. Respond with only the intent category.

Query: "{query}"

Intent categories:
- step_question: asking about a specific step or procedure
- safety_question: asking about safety, warnings, or precautions
- procedure_overview: wants overview or summary of a procedure
- navigation: wants to go to next/previous step or navigate through procedure
- clarification: needs clarification or more details about something
- troubleshooting: asking about problems or what to do if something goes wrong
- general: general question about the SOP or system

Intent:"""
        
        try:
            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": intent_prompt}],
                model=self.model,
                temperature=0.1,
                max_tokens=50
            )
            
            intent = response.choices[0].message.content.strip().lower()
            
            # Validate intent
            valid_intents = ['step_question', 'safety_question', 'procedure_overview', 
                        'navigation', 'clarification', 'troubleshooting', 'general']
            
            if intent not in valid_intents:
                intent = 'general'
            
            return {
                "intent": intent,
                "confidence": 0.8,
                "query": query
            }
            
        except Exception as e:
            logger.error(f"Error extracting intent: {str(e)}")
            return {
                "intent": "general",
                "confidence": 0.5,
                "query": query,
                "error": str(e)
            }
    
    def summarize_document(self, text: str, max_length: int = 200) -> str:
        """Generate a summary of document text"""
        try:
            prompt = f"""Summarize the following SOP document text in {max_length} words or less. Focus on the main procedures, key steps, and any safety considerations.

Text:
{text}

Summary:"""
            
            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
                temperature=0.3,
                max_tokens=max_length + 50
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error summarizing document: {str(e)}")
            return "Unable to generate summary."
    
    def extract_safety_info(self, text: str) -> List[str]:
        """Extract safety information from text"""
        try:
            prompt = f"""Extract all safety-related information from the following text. Include warnings, cautions, safety procedures, and any critical safety points. Return as a JSON list of strings.

Text:
{text}

Safety information (JSON format):"""
            
            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
                temperature=0.1,
                max_tokens=500
            )
            
            # Try to parse JSON response
            try:
                safety_info = json.loads(response.choices[0].message.content.strip())
                if isinstance(safety_info, list):
                    return safety_info
            except json.JSONDecodeError:
                pass
            
            # Fallback: return as single item list
            return [response.choices[0].message.content.strip()]
            
        except Exception as e:
            logger.error(f"Error extracting safety info: {str(e)}")
            return []
    
    def validate_step_completion(self, step_description: str, user_input: str) -> Dict[str, Any]:
        """Validate if a step has been completed correctly"""
        try:
            prompt = f"""Based on the SOP step description and user's reported action, determine if the step was completed correctly.

Step Description:
{step_description}

User Reported Action:
{user_input}

Respond with JSON format:
{{
    "completed": true/false,
    "confidence": 0.0-1.0,
    "feedback": "explanation of validation result",
    "next_action": "what should be done next"
}}"""
            
            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
                temperature=0.2,
                max_tokens=300
            )
            
            try:
                result = json.loads(response.choices[0].message.content.strip())
                return result
            except json.JSONDecodeError:
                return {
                    "completed": False,
                    "confidence": 0.5,
                    "feedback": "Unable to validate step completion.",
                    "next_action": "Please provide more details about the step completion."
                }
                
        except Exception as e:
            logger.error(f"Error validating step completion: {str(e)}")
            return {
                "completed": False,
                "confidence": 0.0,
                "feedback": f"Error during validation: {str(e)}",
                "next_action": "Please try again."
            }
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model"""
        return {
            "model": self.model,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "provider": "Groq"
        }
