import os
import json
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
import warnings
from pathlib import Path
from datetime import datetime
# KG Integration
from Knowledge_Graph.kg_utils import get_neo4j_driver, get_steps_related_to_entity
from Knowledge_Graph.kg_utils import extract_entities_from_query
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ChromaDB import with proper error handling
try:
    import chromadb
    from chromadb.config import Settings
    CHROMADB_AVAILABLE = True
    logger.info("✓ ChromaDB imported successfully")
except Exception as e:
    logger.warning(f"ChromaDB not available: {e}")
    CHROMADB_AVAILABLE = False
    
    # Create fallback ChromaDB classes
    class MockCollection:
        def __init__(self):
            self.documents = []
            self.metadatas = []
            self.ids = []
            
        def add(self, documents, metadatas=None, ids=None, embeddings=None):
            if documents:
                for i, doc in enumerate(documents):
                    doc_id = ids[i] if ids else f"doc_{len(self.documents)}"
                    metadata = metadatas[i] if metadatas else {}
                    self.documents.append(doc)
                    self.metadatas.append(metadata)
                    self.ids.append(doc_id)
                    
        def query(self, query_texts, n_results=5, **kwargs):
            # Simple text matching for fallback
            if not self.documents:
                return {"documents": [[]], "metadatas": [[]], "distances": [[]]}
                
            results = []
            for query in query_texts:
                matches = []
                for i, doc in enumerate(self.documents):
                    if any(word.lower() in doc.lower() for word in query.lower().split()):
                        matches.append((doc, self.metadatas[i], 0.5))
                
                # Sort by relevance and limit results
                matches = matches[:n_results]
                docs = [match[0] for match in matches]
                metas = [match[1] for match in matches]
                distances = [match[2] for match in matches]
                results.append((docs, metas, distances))
                
            return {
                "documents": [result[0] for result in results],
                "metadatas": [result[1] for result in results], 
                "distances": [result[2] for result in results]
            }
            
        def delete(self, ids=None):
            if ids:
                for doc_id in ids:
                    if doc_id in self.ids:
                        idx = self.ids.index(doc_id)
                        del self.documents[idx]
                        del self.metadatas[idx]
                        del self.ids[idx]
                        
        def count(self):
            return len(self.documents)
    
    class MockClient:
        def __init__(self, path=None):
            self.collections = {}
            
        def get_or_create_collection(self, name):
            if name not in self.collections:
                self.collections[name] = MockCollection()
            return self.collections[name]
            
        def delete_collection(self, name):
            if name in self.collections:
                del self.collections[name]
    
    chromadb = type('chromadb', (), {
        'Client': MockClient,
        'PersistentClient': MockClient
    })

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    logger.warning("sentence-transformers not available, using simple text matching")
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    SentenceTransformer = None

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    logger.warning("numpy not available, using basic operations")
    NUMPY_AVAILABLE = False
    np = None

class RAGEngine:
    def __init__(self, db_path: str = None):
        self.db_path = db_path or os.getenv('VECTOR_DB_PATH', './vector_db')
        self.embedding_model_name = os.getenv('EMBEDDING_MODEL', 'all-MiniLM-L6-v2')
        self.max_search_results = int(os.getenv('MAX_SEARCH_RESULTS', 5))
        
        # Initialize ChromaDB
        try:
            self.client = chromadb.PersistentClient(path=self.db_path)
            self.collection = self.client.get_or_create_collection(
                name="sop_documents",
                metadata={"hnsw:space": "cosine"}
            )
            logger.info(f"ChromaDB initialized at {self.db_path}")
        except Exception as e:
            logger.error(f"Error initializing ChromaDB: {str(e)}")
            raise
        
        # Initialize embedding model
        try:
            self.embedding_model = SentenceTransformer(self.embedding_model_name)
            logger.info(f"Embedding model {self.embedding_model_name} loaded successfully")
        except Exception as e:
            logger.error(f"Error loading embedding model: {str(e)}")
            raise
    
    def add_documents(self, documents: List[Dict]) -> Dict[str, Any]:
        """Add documents to vector database"""
        try:
            if not documents:
                return {"status": "error", "message": "No documents provided"}
            
            texts = [doc['text'] for doc in documents]
            
            # Generate embeddings
            logger.info(f"Generating embeddings for {len(texts)} documents...")
            embeddings = self.embedding_model.encode(texts, show_progress_bar=True).tolist()
            
            # Create unique IDs
            ids = [f"{doc['source']}_{doc['chunk_id']}_{datetime.now().timestamp()}" for doc in documents]
            
            # Prepare metadata
            metadatas = []
            for doc in documents:
                metadata = {
                    'source': doc['source'],
                    'chunk_id': doc['chunk_id'],
                    'file_type': doc['file_type'],
                    'chunk_size': doc['chunk_size'],
                    'steps_count': len(doc['steps']),
                    'safety_notes_count': len(doc['safety_notes']),
                    'added_timestamp': datetime.now().isoformat()
                }
                metadatas.append(metadata)
            
            # Add to collection
            self.collection.add(
                embeddings=embeddings,
                documents=texts,
                metadatas=metadatas,
                ids=ids
            )
            
            logger.info(f"Successfully added {len(documents)} documents to vector database")
            return {
                "status": "success",
                "documents_added": len(documents),
                "total_documents": self.collection.count()
            }
            
        except Exception as e:
            logger.error(f"Error adding documents to vector database: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def search_documents(self, query: str, n_results: int = None, filter_metadata: Dict = None) -> List[Dict]:
        """Search for relevant documents"""
        try:
            n_results = n_results or self.max_search_results
            
            # Generate query embedding
            query_embedding = self.embedding_model.encode([query]).tolist()
            
            # Prepare search parameters
            search_params = {
                "query_embeddings": query_embedding,
                "n_results": min(n_results, self.collection.count()),
                "include": ['documents', 'metadatas', 'distances']
            }
            
            # Add metadata filter if provided
            if filter_metadata:
                search_params["where"] = filter_metadata
            
            # Perform search
            results = self.collection.query(**search_params)
            
            # Format results
            formatted_results = []
            if results['documents'] and results['documents'][0]:
                for i in range(len(results['documents'][0])):
                    relevance_score = 1 - results['distances'][0][i]
                    formatted_results.append({
                        'text': results['documents'][0][i],
                        'metadata': results['metadatas'][0][i],
                        'relevance_score': relevance_score,
                        'distance': results['distances'][0][i]
                    })
            
            # Sort by relevance score
            formatted_results.sort(key=lambda x: x['relevance_score'], reverse=True)
            
            logger.info(f"Found {len(formatted_results)} relevant documents for query: {query[:50]}...")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching documents: {str(e)}")
            return []
    
    def search_by_source(self, source_filename: str, query: str = None) -> List[Dict]:
        """Search documents from specific source file"""
        try:
            filter_metadata = {"source": source_filename}
            
            if query:
                return self.search_documents(query, filter_metadata=filter_metadata)
            else:
                # Return all chunks from this source
                results = self.collection.get(
                    where=filter_metadata,
                    include=['documents', 'metadatas']
                )
                
                formatted_results = []
                if results['documents']:
                    for i, doc in enumerate(results['documents']):
                        formatted_results.append({
                            'text': doc,
                            'metadata': results['metadatas'][i],
                            'relevance_score': 1.0,
                            'distance': 0.0
                        })
                
                return formatted_results
                
        except Exception as e:
            logger.error(f"Error searching by source: {str(e)}")
            return []
    
    def get_similar_documents(self, document_id: str, n_results: int = 3) -> List[Dict]:
        """Find documents similar to a specific document"""
        try:
            # Get the document
            doc_result = self.collection.get(
                ids=[document_id],
                include=['embeddings', 'documents', 'metadatas']
            )
            
            if not doc_result['embeddings']:
                return []
            
            # Use the document's embedding to find similar ones
            results = self.collection.query(
                query_embeddings=doc_result['embeddings'],
                n_results=n_results + 1,  # +1 to exclude the original document
                include=['documents', 'metadatas', 'distances']
            )
            
            # Format and filter out the original document
            formatted_results = []
            for i in range(len(results['documents'][0])):
                if results['documents'][0][i] != doc_result['documents'][0]:
                    formatted_results.append({
                        'text': results['documents'][0][i],
                        'metadata': results['metadatas'][0][i],
                        'relevance_score': 1 - results['distances'][0][i],
                        'distance': results['distances'][0][i]
                    })
            
            return formatted_results[:n_results]
            
        except Exception as e:
            logger.error(f"Error finding similar documents: {str(e)}")
            return []
    
    def delete_documents_by_source(self, source_filename: str) -> Dict[str, Any]:
        """Delete all documents from a specific source"""
        try:
            # Get all documents from this source
            results = self.collection.get(
                where={"source": source_filename},
                include=['metadatas']
            )
            
            if not results['ids']:
                return {"status": "info", "message": "No documents found for this source"}
            
            # Delete documents
            self.collection.delete(ids=results['ids'])
            
            logger.info(f"Deleted {len(results['ids'])} documents from source: {source_filename}")
            return {
                "status": "success",
                "deleted_count": len(results['ids']),
                "remaining_documents": self.collection.count()
            }
            
        except Exception as e:
            logger.error(f"Error deleting documents: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get collection statistics"""
        try:
            total_count = self.collection.count()
            
            # Get all documents to analyze
            if total_count > 0:
                all_docs = self.collection.get(include=['metadatas'])
                
                # Analyze sources
                sources = {}
                file_types = {}
                
                for metadata in all_docs['metadatas']:
                    source = metadata.get('source', 'unknown')
                    file_type = metadata.get('file_type', 'unknown')
                    
                    sources[source] = sources.get(source, 0) + 1
                    file_types[file_type] = file_types.get(file_type, 0) + 1
                
                return {
                    "total_documents": total_count,
                    "collection_name": self.collection.name,
                    "sources": sources,
                    "file_types": file_types,
                    "embedding_model": self.embedding_model_name,
                    "db_path": self.db_path
                }
            else:
                return {
                    "total_documents": 0,
                    "collection_name": self.collection.name,
                    "sources": {},
                    "file_types": {},
                    "embedding_model": self.embedding_model_name,
                    "db_path": self.db_path
                }
                
        except Exception as e:
            logger.error(f"Error getting collection stats: {str(e)}")
            return {"error": str(e)}
    
    def clear_collection(self) -> Dict[str, Any]:
        """Clear all documents from collection"""
        try:
            # Delete the collection and recreate it
            self.client.delete_collection(name="sop_documents")
            self.collection = self.client.get_or_create_collection(
                name="sop_documents",
                metadata={"hnsw:space": "cosine"}
            )
            
            logger.info("Collection cleared successfully")
            return {"status": "success", "message": "Collection cleared"}
            
        except Exception as e:
            logger.error(f"Error clearing collection: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def export_documents(self, output_path: str) -> Dict[str, Any]:
        """Export all documents to a file"""
        try:
            import json
            
            all_docs = self.collection.get(
                include=['documents', 'metadatas', 'embeddings']
            )
            
            export_data = {
                "collection_name": self.collection.name,
                "total_documents": len(all_docs['documents']),
                "export_timestamp": datetime.now().isoformat(),
                "documents": []
            }
            
            for i in range(len(all_docs['documents'])):
                export_data["documents"].append({
                    "id": all_docs['ids'][i],
                    "text": all_docs['documents'][i],
                    "metadata": all_docs['metadatas'][i],
                    "embedding": all_docs['embeddings'][i] if all_docs['embeddings'] else None
                })
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Exported {len(all_docs['documents'])} documents to {output_path}")
            return {"status": "success", "exported_count": len(all_docs['documents'])}
            
        except Exception as e:
            logger.error(f"Error exporting documents: {str(e)}")
            return {"status": "error", "message": str(e)}
    # KG integration
    def filter_rag_results_with_kg(self, rag_results, query, driver):
        """
        Use KG to filter or expand RAG results.
        E.g., only keep RAG results that are related to entities found in the KG.
        """
        # Example: extract entities from query (use spaCy, regex, or LLM for real use)
        entities = extract_entities_from_query(query)  # You need to implement this
        print(f"[KG] Entities for filtering: {entities}")
        relevant_step_ids = set()
        for entity in entities:
            steps = get_steps_related_to_entity(entity, driver)
            step_ids = [step['id'] for step in steps if 'id' in step]
            print(f"[KG] Steps found for entity '{entity}': {step_ids}")
            relevant_step_ids.update(step_ids)
        # Filter RAG results
        filtered = [res for res in rag_results if res['metadata'].get('chunk_id') in relevant_step_ids]
        if filtered:
            print(f"[KG] Filtered RAG results using KG: {len(filtered)}")
        else:
            print("[KG] No relevant KG results, returning original RAG results.")
        # If nothing found, fallback to original RAG results
        return filtered if filtered else rag_results
