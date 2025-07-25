from neo4j import GraphDatabase
import os

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASS = os.getenv("NEO4J_PASS", "testpassword")

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
            # Start a transaction for this step and related nodes
            with session.begin_transaction() as tx:
                # Create or merge Chunk node
                tx.run(
                    """
                    MERGE (c:Chunk {id: $chunk_id})
                    SET c.text = $chunk_text, c.size = $chunk_size, c.source = $source, c.embedding = $embedding
                    """,
                    {
                        "chunk_id": step['chunk_id'],
                        "chunk_text": step['description'],  # use description, not text
                        "chunk_size": step.get('chunk_size', len(step['description'])),
                        "source": sop['source'],
                        "embedding": step.get('embedding')
                    }
                )
                # Create or merge Section node and link to SOP and Chunk
                section_title = step.get('section', '')
                if section_title:
                    tx.run(
                        """
                        MERGE (h:Section {title: $section})
                        MERGE (sop:SOP {id: $sop_id})
                        MERGE (h)-[:CONTAINS_CHUNK]->(c:Chunk {id: $chunk_id})
                        MERGE (sop)-[:HAS_SECTION]->(h)
                        """,
                        {
                            "section": section_title,
                            "sop_id": sop['id'],
                            "chunk_id": step['chunk_id']
                        }
                    )
                # Create Step node and link to SOP and Chunk
                tx.run(
                    """
                    MERGE (step:Step {id: $id})
                    SET step.description = $description, step.order = $order, step.chunk_id = $chunk_id
                    MERGE (sop:SOP {id: $sop_id})
                    MERGE (sop)-[:HAS_STEP]->(step)
                    MERGE (step)-[:LOCATED_IN]->(c:Chunk {id: $chunk_id})
                    """,
                    {
                        "id": step['id'],
                        "description": step['description'],  # use description, not text
                        "order": step['order'],
                        "chunk_id": step['chunk_id'],
                        "sop_id": sop['id']
                    }
                )
                # Tools
                for tool in step.get('tools', []):
                    tx.run(
                        """
                        MERGE (tool:Tool {name: $tool})
                        MERGE (step:Step {id: $step_id})
                        MERGE (step)-[:REQUIRES_TOOL]->(tool)
                        """,
                        {"tool": tool, "step_id": step['id']}
                    )
                # Materials
                for material in step.get('materials', []):
                    tx.run(
                        """
                        MERGE (mat:Material {name: $material})
                        MERGE (step:Step {id: $step_id})
                        MERGE (step)-[:USES_MATERIAL]->(mat)
                        """,
                        {"material": material, "step_id": step['id']}
                    )
                # Safety Notes
                for note in step.get('safety_notes', []):
                    tx.run(
                        """
                        MERGE (sn:SafetyNote {text: $note})
                        MERGE (step:Step {id: $step_id})
                        MERGE (step)-[:HAS_SAFETY_NOTE]->(sn)
                        """,
                        {"note": note, "step_id": step['id']}
                    )
                # Technical Concepts
                for concept in step.get('technical_concepts', []):
                    tx.run(
                        """
                        MERGE (tc:TechnicalConcept {name: $concept})
                        MERGE (step:Step {id: $step_id})
                        MERGE (step)-[:MENTIONS_TECHNICAL_CONCEPT]->(tc)
                        """,
                        {"concept": concept, "step_id": step['id']}
                    )
                # Statistical Figures
                for figure in step.get('statistical_figures', []):
                    tx.run(
                        """
                        MERGE (sf:StatisticalFigure {value: $figure})
                        MERGE (step:Step {id: $step_id})
                        MERGE (step)-[:CITES_STATISTICAL_FIGURE]->(sf)
                        """,
                        {"figure": figure, "step_id": step['id']}
                    )
                # Graph References
                for graph_ref in step.get('graph_references', []):
                    tx.run(
                        """
                        MERGE (gr:GraphReference {reference: $graph_ref})
                        MERGE (step:Step {id: $step_id})
                        MERGE (step)-[:REFERS_TO_GRAPH]->(gr)
                        """,
                        {"graph_ref": graph_ref, "step_id": step['id']}
                    )
                # Definitions
                for definition in step.get('definitions', []):
                    tx.run(
                        """
                        MERGE (def:Definition {term: $term})
                        SET def.text = $definition
                        MERGE (step:Step {id: $step_id})
                        MERGE (step)-[:DEFINES]->(def)
                        """,
                        {"term": definition['term'], "definition": definition['definition'], "step_id": step['id']}
                    )
                tx.commit()
