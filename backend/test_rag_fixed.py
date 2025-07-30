#!/usr/bin/env python3
"""
Test script to verify ChromaDB and RAG functionality
"""

import os
import sys
sys.path.append('/Users/namansingh/Documents/GitHub/LIve-SOP-Interpreter/backend')

from rag_engine import RAGEngine

def test_rag_functionality():
    """Test the RAG engine functionality"""
    print("🧪 Testing RAG Engine Functionality...")
    
    # Initialize RAG engine
    rag_engine = RAGEngine("./test_vector_db")
    
    # Test documents
    test_docs = [
        "The emergency procedure requires immediate evacuation of the building.",
        "Safety guidelines mandate wearing protective equipment at all times.",
        "Standard operating procedure for equipment maintenance includes weekly inspections.",
        "Quality control measures ensure product standards are met consistently."
    ]
    
    test_metadata = [
        {"source": "emergency_sop.pdf", "section": "evacuation"},
        {"source": "safety_sop.pdf", "section": "ppe"},
        {"source": "maintenance_sop.pdf", "section": "inspection"},
        {"source": "quality_sop.pdf", "section": "control"}
    ]
    
    print("📝 Adding test documents...")
    success = rag_engine.add_documents(test_docs, test_metadata)
    print(f"✅ Documents added: {success}")
    
    # Test search functionality
    print("\n🔍 Testing search functionality...")
    test_queries = [
        "What are the emergency procedures?",
        "Tell me about safety requirements",
        "How often should maintenance be performed?",
        "What about quality standards?"
    ]
    
    for query in test_queries:
        print(f"\n🎯 Query: '{query}'")
        results = rag_engine.search_documents(query, n_results=2)
        
        if results:
            for i, result in enumerate(results):
                print(f"  Result {i+1}:")
                print(f"    Text: {result['text'][:100]}...")
                print(f"    Score: {result['relevance_score']:.3f}")
                print(f"    Source: {result['metadata'].get('source', 'unknown')}")
        else:
            print("  ❌ No results found")
    
    # Test document count
    count = rag_engine.get_document_count()
    print(f"\n📊 Total documents in database: {count}")
    
    # Test status
    status = rag_engine.get_status()
    print(f"\n📈 RAG Engine Status:")
    for key, value in status.items():
        print(f"  {key}: {value}")
    
    print("\n✅ RAG Engine test completed!")
    
    # Cleanup
    rag_engine.clear_database()
    print("🧹 Test database cleaned up")

if __name__ == "__main__":
    test_rag_functionality()
