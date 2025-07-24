import os
from neo4j import GraphDatabase

NEO4J_URI = os.getenv("NEO4J_URI") or "bolt://localhost:7687"
NEO4J_USER = os.getenv("NEO4J_USER") or "neo4j"
NEO4J_PASS = os.getenv("NEO4J_PASS") or "testpassword"

def get_neo4j_driver():
    return GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASS))

def ingest_sop_to_kg(sop, driver):
    """
    sop: {
        'id': str,
        'title': str,
        'file_type': str,
        'source': str,
        'created_at': str,
        'steps': [
            {
                'id': str,
                'description': str,
                'order': int,
                'chunk_id': str,
                'tools': [str],
                'materials': [str],
                'safety_notes': [str]
            },
            ...
        ]
    }
    """
    with driver.session() as session:
        # Create SOP node
        session.run(
            """
            MERGE (sop:SOP {id: $id})
            SET sop.title = $title, sop.file_type = $file_type, sop.source = $source, sop.created_at = $created_at
            """,
            sop
        )
        for step in sop['steps']:
            session.run(
                """
                MERGE (step:Step {id: $id})
                SET step.description = $description, step.order = $order, step.chunk_id = $chunk_id
                MERGE (sop:SOP {id: $sop_id})
                MERGE (sop)-[:HAS_STEP]->(step)
                """,
                {
                    "id": step['id'],
                    "description": step['description'],
                    "order": step['order'],
                    "chunk_id": step['chunk_id'],
                    "sop_id": sop['id']
                }
            )
            for tool in step.get('tools', []):
                session.run(
                    """
                    MERGE (tool:Tool {name: $tool})
                    MERGE (step:Step {id: $step_id})
                    MERGE (step)-[:REQUIRES_TOOL]->(tool)
                    """,
                    {"tool": tool, "step_id": step['id']}
                )
            for material in step.get('materials', []):
                session.run(
                    """
                    MERGE (mat:Material {name: $material})
                    MERGE (step:Step {id: $step_id})
                    MERGE (step)-[:USES_MATERIAL]->(mat)
                    """,
                    {"material": material, "step_id": step['id']}
                )
            for note in step.get('safety_notes', []):
                session.run(
                    """
                    MERGE (sn:SafetyNote {text: $note})
                    MERGE (step:Step {id: $step_id})
                    MERGE (step)-[:HAS_SAFETY_NOTE]->(sn)
                    """,
                    {"note": note, "step_id": step['id']}
                )

def get_steps_related_to_entity(entity, driver):
    """
    Returns steps related to a tool/material/safety note.
    """
    with driver.session() as session:
        result = session.run(
            """
            MATCH (step:Step)-[r]->(e)
            WHERE e.name = $entity OR e.text = $entity
            RETURN DISTINCT step
            """,
            {"entity": entity}
        )
        return [record["step"] for record in result]

def get_tools_for_sop(sop_id, driver):
    with driver.session() as session:
        result = session.run(
            """
            MATCH (sop:SOP {id: $sop_id})-[:HAS_STEP]->(step)-[:REQUIRES_TOOL]->(tool)
            RETURN DISTINCT tool.name AS tool
            """,
            {"sop_id": sop_id}
        )
        return [record["tool"] for record in result]

def filter_rag_results_with_kg(rag_results, query, driver):
    print("[KG] Starting KG-based filtering/expansion...")
    entities = extract_entities_from_query(query)
    print(f"[KG] Entities extracted from query: {entities}")
    relevant_step_ids = set()
    for entity in entities:
        steps = get_steps_related_to_entity(entity, driver)
        step_ids = [step['id'] for step in steps if 'id' in step]
        print(f"[KG] Steps found for entity '{entity}': {step_ids}")
        relevant_step_ids.update(step_ids)
    filtered = [res for res in rag_results if res['metadata'].get('chunk_id') in relevant_step_ids]
    if filtered:
        print(f"[KG] Filtered RAG results using KG: {len(filtered)} out of {len(rag_results)}")
    else:
        print("[KG] No relevant KG results, returning original RAG results.")
    return filtered if filtered else rag_results

def kg_filter_step(state):
    print("[KGFilter] Entering KG filter step.")
    driver = state['kg_driver']
    query = state['query']
    rag_results = state['rag_results']
    print(f"[KGFilter] Number of RAG results before KG filtering: {len(rag_results)}")
    filtered = filter_rag_results_with_kg(rag_results, query, driver)
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
    # Assuming GroqClient is defined elsewhere or will be added.
    # For now, just print a placeholder.
    # groq_client = GroqClient()
    # response = groq_client.generate_response(query, context)
    # print(f"[GroqAnswer] Groq response snippet: {response['response'][:100]}...")
    # state['answer'] = response['response']
    # state['groq_metadata'] = response
    state['answer'] = "KG context not available for Groq answer."
    state['groq_metadata'] = {}
    return state

def extract_entities_from_query(query):
    # Example: simple regex for capitalized words
    import re
    entities = re.findall(r'\b[A-Z][a-zA-Z]+\b', query)
    print(f"[KG] extract_entities_from_query: Extracted entities: {entities}")
    return entities
