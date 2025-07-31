import os
from neo4j import GraphDatabase

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
    Returns steps related to a tool/material/safety note with fuzzy matching.
    """
    with driver.session() as session:
        # Try exact match first
        result = session.run(
            """
            MATCH (step:Step)-[r]->(e)
            WHERE e.name = $entity OR e.text = $entity
            RETURN DISTINCT step, type(r) as relationship_type, e
            """,
            {"entity": entity}
        )
        
        exact_matches = []
        for record in result:
            step_data = dict(record["step"])
            step_data['relationship_type'] = record['relationship_type']
            step_data['matched_entity'] = dict(record['e'])
            exact_matches.append(step_data)
        
        if exact_matches:
            print(f"[KG] Found {len(exact_matches)} exact matches for entity '{entity}'")
            return exact_matches
        
        # Try case-insensitive partial match
        result = session.run(
            """
            MATCH (step:Step)-[r]->(e)
            WHERE toLower(e.name) CONTAINS toLower($entity) 
               OR toLower(e.text) CONTAINS toLower($entity)
               OR toLower($entity) CONTAINS toLower(e.name)
               OR toLower($entity) CONTAINS toLower(e.text)
            RETURN DISTINCT step, type(r) as relationship_type, e
            """,
            {"entity": entity}
        )
        
        partial_matches = []
        for record in result:
            step_data = dict(record["step"])
            step_data['relationship_type'] = record['relationship_type']
            step_data['matched_entity'] = dict(record['e'])
            partial_matches.append(step_data)
        
        if partial_matches:
            print(f"[KG] Found {len(partial_matches)} partial matches for entity '{entity}'")
        else:
            print(f"[KG] No matches found for entity '{entity}'")
        
        return partial_matches

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
    """Enhanced KG-based filtering with better entity matching and context understanding."""
    print("[KG] Starting enhanced KG-based filtering/expansion...")
    entities = extract_entities_from_query(query)
    print(f"[KG] Entities extracted from query: {entities}")
    
    if not entities:
        print("[KG] No entities extracted, returning original RAG results")
        return rag_results
    
    relevant_step_ids = set()
    entity_matches = {}
    
    for entity in entities:
        steps = get_steps_related_to_entity(entity, driver)
        if steps:
            step_ids = [step['id'] for step in steps if 'id' in step]
            print(f"[KG] Steps found for entity '{entity}': {step_ids}")
            relevant_step_ids.update(step_ids)
            entity_matches[entity] = {
                'step_count': len(step_ids),
                'relationships': [step.get('relationship_type', 'unknown') for step in steps]
            }
        else:
            print(f"[KG] No steps found for entity '{entity}'")
    
    if not relevant_step_ids:
        print("[KG] No relevant steps found in KG, returning original RAG results")
        return rag_results
    
    # Filter RAG results based on chunk_id matching
    filtered = []
    for res in rag_results:
        chunk_id = res.get('metadata', {}).get('chunk_id')
        if chunk_id in relevant_step_ids:
            # Add KG context to the result
            res['kg_context'] = {
                'matched_entities': entity_matches,
                'kg_enhanced': True
            }
            filtered.append(res)
    
    if filtered:
        print(f"[KG] Filtered RAG results using KG: {len(filtered)} out of {len(rag_results)}")
        print(f"[KG] Entity match summary: {entity_matches}")
        return filtered
    else:
        print("[KG] No RAG results matched KG entities, checking for semantic overlap...")
        
        # Fallback: check for semantic overlap in text content
        semantic_filtered = []
        for res in rag_results:
            text = res.get('text', '').lower()
            for entity in entities:
                if entity.lower() in text:
                    res['kg_context'] = {
                        'semantic_match': entity,
                        'kg_enhanced': False
                    }
                    semantic_filtered.append(res)
                    break
        
        if semantic_filtered:
            print(f"[KG] Applied semantic filtering: {len(semantic_filtered)} results")
            return semantic_filtered
        else:
            print("[KG] No semantic overlap found, returning original RAG results")
            return rag_results

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
    """
    Enhanced entity extraction using spaCy NLP and context-aware patterns.
    Extracts tools, materials, technical concepts, and domain-specific entities.
    """
    import re
    try:
        import spacy
        nlp = spacy.load('en_core_web_sm')
    except Exception:
        print("[KG] spaCy not available, falling back to regex patterns")
        nlp = None
    
    entities = set()
    
    # spaCy-based entity extraction
    if nlp:
        doc = nlp(query)
        
        # Extract named entities
        for ent in doc.ents:
            if ent.label_ in ['PERSON', 'ORG', 'PRODUCT', 'EVENT', 'WORK_OF_ART', 'LAW', 'LANGUAGE']:
                entities.add(ent.text.strip())
        
        # Extract noun phrases (potential tools/materials/concepts)
        for chunk in doc.noun_chunks:
            # Filter meaningful noun phrases (2+ words or capitalized single words)
            if len(chunk.text.split()) > 1 or chunk.text[0].isupper():
                entities.add(chunk.text.strip())
        
        # Extract technical terms (words with specific POS patterns)
        for token in doc:
            # Technical terms are often nouns, proper nouns, or adjectives
            if (token.pos_ in ['NOUN', 'PROPN'] and 
                len(token.text) > 2 and 
                not token.is_stop and 
                not token.is_punct):
                entities.add(token.text.strip())
    
    # Domain-specific patterns for SOPs
    domain_patterns = [
        # Tools and equipment
        r'\b(?:wrench|screwdriver|multimeter|oscilloscope|drill|pliers|hammer|caliper|thermometer)\b',
        r'\b(?:saw|grinder|welder|lathe|press|pump|compressor|generator|motor)\b',
        r'\b(?:gauge|meter|tester|analyzer|detector|sensor|probe|scanner)\b',
        
        # Materials and substances
        r'\b(?:steel|aluminum|copper|brass|plastic|rubber|glass|ceramic|concrete)\b',
        r'\b(?:oil|lubricant|coolant|solvent|acetone|ethanol|acid|alkali|solution)\b',
        r'\b(?:gasket|seal|bearing|bolt|screw|nut|washer|spring|valve|filter)\b',
        
        # Safety equipment
        r'\b(?:helmet|gloves|goggles|mask|harness|boots|vest|respirator)\b',
        r'\b(?:PPE|personal protective equipment|safety equipment|protective gear)\b',
        
        # Technical concepts
        r'\b(?:pressure|temperature|voltage|current|resistance|frequency|torque)\b',
        r'\b(?:calibration|maintenance|inspection|testing|troubleshooting|diagnosis)\b',
        r'\b(?:installation|removal|replacement|adjustment|alignment|assembly)\b',
        
        # Measurement units
        r'\b\d+\s*(?:mm|cm|m|kg|g|lb|psi|bar|V|A|Ω|Hz|rpm|°C|°F)\b',
        
        # Part numbers and codes
        r'\b[A-Z]+\d+[A-Z]*\b',  # Pattern like ABC123, XYZ456A
        r'\b\d+[A-Z]+\d*\b',     # Pattern like 123ABC, 456XYZ789
        
        # Procedure-specific terms
        r'\b(?:step|procedure|protocol|standard|guideline|specification|requirement)\b',
        r'\b(?:before|after|during|while|until|when|if|unless|provided|ensure)\b'
    ]
    
    # Apply domain patterns
    for pattern in domain_patterns:
        matches = re.findall(pattern, query, re.IGNORECASE)
        entities.update([match.strip() for match in matches])
    
    # Extract capitalized words (fallback)
    capitalized_words = re.findall(r'\b[A-Z][a-zA-Z]+\b', query)
    entities.update(capitalized_words)
    
    # Extract quoted terms
    quoted_terms = re.findall(r'"([^"]+)"', query)
    entities.update(quoted_terms)
    
    # Extract technical abbreviations
    abbreviations = re.findall(r'\b[A-Z]{2,}\b', query)
    entities.update(abbreviations)
    
    # Clean and filter entities
    filtered_entities = []
    stop_words = {'THE', 'AND', 'OR', 'BUT', 'FOR', 'NOR', 'SO', 'YET', 'A', 'AN', 'TO', 'OF', 'IN', 'ON', 'AT', 'BY', 'FROM', 'WITH', 'ABOUT'}
    
    for entity in entities:
        entity = entity.strip()
        if (len(entity) > 1 and 
            entity.upper() not in stop_words and 
            not entity.isdigit() and
            not all(c in '.,!?;:' for c in entity)):
            filtered_entities.append(entity)
    
    # Remove duplicates while preserving order
    unique_entities = []
    seen = set()
    for entity in filtered_entities:
        if entity.lower() not in seen:
            unique_entities.append(entity)
            seen.add(entity.lower())
    
    print(f"[KG] extract_entities_from_query: Query: '{query}'")
    print(f"[KG] extract_entities_from_query: Extracted entities: {unique_entities}")
    return unique_entities

def get_entity_context(entity, driver):
    """
    Get comprehensive context for an entity from the Knowledge Graph.
    Returns related entities, relationships, and procedural context.
    """
    with driver.session() as session:
        result = session.run(
            """
            MATCH (e)-[r]-(related)
            WHERE (e.name = $entity OR e.text = $entity OR 
                   toLower(e.name) CONTAINS toLower($entity) OR 
                   toLower(e.text) CONTAINS toLower($entity))
            RETURN e, type(r) as relationship, related, labels(e) as entity_type, labels(related) as related_type
            LIMIT 20
            """,
            {"entity": entity}
        )
        
        context = {
            'entity': entity,
            'found_matches': [],
            'relationships': [],
            'related_entities': set()
        }
        
        for record in result:
            entity_data = dict(record['e'])
            related_data = dict(record['related'])
            
            context['found_matches'].append({
                'entity': entity_data,
                'entity_type': record['entity_type'],
                'relationship': record['relationship'],
                'related': related_data,
                'related_type': record['related_type']
            })
            
            # Add to related entities for expansion
            if 'name' in related_data:
                context['related_entities'].add(related_data['name'])
            elif 'text' in related_data:
                context['related_entities'].add(related_data['text'])
        
        context['related_entities'] = list(context['related_entities'])
        return context

def expand_query_with_kg_context(query, driver):
    """
    Expand query with related entities from Knowledge Graph.
    """
    entities = extract_entities_from_query(query)
    expanded_terms = set(entities)
    
    for entity in entities:
        context = get_entity_context(entity, driver)
        # Add related entities that might be relevant
        for related in context['related_entities'][:3]:  # Limit to avoid explosion
            expanded_terms.add(related)
    
    return list(expanded_terms)
