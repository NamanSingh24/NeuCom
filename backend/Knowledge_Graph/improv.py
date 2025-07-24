from langgraph.graph import StateGraph, END
from rag_engine import RAGEngine, filter_rag_results_with_kg
from kg_utils import get_neo4j_driver
from groq_client import GroqClient

# 1. Define the workflow steps
def rag_search_step(state):
    query = state['query']
    rag_results = state['rag_engine'].search_documents(query)
    state['rag_results'] = rag_results
    return state

def kg_filter_step(state):
    print("[KGFilter] Entering KG filter step.")
    driver = state['kg_driver']
    query = state['query']
    rag_results = state['rag_results']
    print(f"[KGFilter] Number of RAG results before KG filtering: {len(rag_results)}")
    filtered = state['rag_engine'].filter_rag_results_with_kg(rag_results, query, driver)
    print(f"[KGFilter] Number of results after KG filtering: {len(filtered)}")
    if len(filtered) < len(rag_results):
        print("[KGFilter] KG filtering reduced the number of results.")
    elif len(filtered) == len(rag_results) and len(filtered) > 0:
        print("[KGFilter] KG filtering did not change the results.")
    else:
        print("[KGFilter] No results after KG filtering, falling back to original RAG results.")
    state['filtered_results'] = filtered
    return state

def groq_answer_step(state):
    print("[GroqAnswer] Entering Groq answer step.")
    query = state['query']
    context = state.get('filtered_results', [])
    print(f"[GroqAnswer] Context length being sent to Groq: {len(context)}")
    if context:
        print(f"[GroqAnswer] First context doc snippet: {context[0]['text'][:100]}...")
    groq_client = GroqClient()
    response = groq_client.generate_response(query, context)
    print(f"[GroqAnswer] Groq response snippet: {response['response'][:100]}...")
    state['answer'] = response['response']
    state['groq_metadata'] = response
    return state

# 2. Build the LangGraph workflow
def build_workflow():
    workflow = StateGraph()
    workflow.add_node("RAGSearch", rag_search_step)
    workflow.add_node("KGFilter", kg_filter_step)
    workflow.add_node("GroqAnswer", groq_answer_step)
    workflow.add_edge("RAGSearch", "KGFilter")
    workflow.add_edge("KGFilter", "GroqAnswer")
    workflow.add_edge("GroqAnswer", END)
    return workflow

# 3. Run the workflow
def answer_query(query):
    rag_engine = RAGEngine()
    kg_driver = get_neo4j_driver()
    workflow = build_workflow()
    initial_state = {
        "query": query,
        "rag_engine": rag_engine,
        "kg_driver": kg_driver
    }
    result = workflow.run(initial_state)
    return result['answer']
