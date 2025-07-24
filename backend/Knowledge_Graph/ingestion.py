from neo4j import GraphDatabase
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASS = "test123"

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
