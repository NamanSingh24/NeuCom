import os
from pathlib import Path
import PyPDF2
from docx import Document
import markdown
from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import List, Dict, Optional
import magic
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentProcessor:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=int(os.getenv('CHUNK_SIZE', 1000)),
            chunk_overlap=int(os.getenv('CHUNK_OVERLAP', 200)),
            separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""]
        )
        self.allowed_extensions = os.getenv('ALLOWED_EXTENSIONS', '.pdf,.docx,.md,.txt').split(',')
    
    def validate_file(self, file_path: str) -> bool:
        """Validate file type and size"""
        try:
            file_ext = Path(file_path).suffix.lower()
            if file_ext not in self.allowed_extensions:
                raise ValueError(f"Unsupported file format: {file_ext}")
            
            # Check file size (50MB default limit)
            max_size = 50 * 1024 * 1024  # 50MB in bytes
            if os.path.getsize(file_path) > max_size:
                raise ValueError("File size exceeds maximum limit")
            
            return True
        except Exception as e:
            logger.error(f"File validation error: {str(e)}")
            return False
    
    def process_document(self, file_path: str) -> List[Dict]:
        """Process document and return chunks with metadata"""
        try:
            if not self.validate_file(file_path):
                raise ValueError("File validation failed")
            
            file_ext = Path(file_path).suffix.lower()
            
            if file_ext == '.pdf':
                text = self._extract_pdf(file_path)
            elif file_ext == '.docx':
                text = self._extract_docx(file_path)
            elif file_ext in ['.md', '.markdown']:
                text = self._extract_markdown(file_path)
            elif file_ext == '.txt':
                text = self._extract_text(file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_ext}")
            
            if not text.strip():
                raise ValueError("No text content found in document")
            
            # Split into chunks
            chunks = self.text_splitter.split_text(text)
            
            # Add metadata
            doc_chunks = []
            for i, chunk in enumerate(chunks):
                doc_chunks.append({
                    'text': chunk,
                    'chunk_id': i,
                    'source': Path(file_path).name,
                    'file_type': file_ext,
                    'file_path': file_path,
                    'chunk_size': len(chunk),
                    'steps': self._extract_steps(chunk),
                    'safety_notes': self._extract_safety_notes(chunk)
                })
            
            logger.info(f"Successfully processed {Path(file_path).name} into {len(chunks)} chunks")
            return doc_chunks
            
        except Exception as e:
            logger.error(f"Error processing document {file_path}: {str(e)}")
            raise
    
    def _extract_pdf(self, file_path: str) -> str:
        """Extract text from PDF"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page_num, page in enumerate(reader.pages):
                    page_text = page.extract_text()
                    if page_text:
                        text += f"\n--- Page {page_num + 1} ---\n" + page_text + "\n"
        except Exception as e:
            raise ValueError(f"Error reading PDF: {str(e)}")
        return text
    
    def _extract_docx(self, file_path: str) -> str:
        """Extract text from DOCX"""
        text = ""
        try:
            doc = Document(file_path)
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text += paragraph.text + "\n"
            
            # Extract text from tables
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        if cell.text.strip():
                            text += cell.text + "\n"
        except Exception as e:
            raise ValueError(f"Error reading DOCX: {str(e)}")
        return text
    
    def _extract_markdown(self, file_path: str) -> str:
        """Extract text from Markdown"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            return content
        except Exception as e:
            raise ValueError(f"Error reading Markdown: {str(e)}")
    
    def _extract_text(self, file_path: str) -> str:
        """Extract text from plain text file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            return content
        except Exception as e:
            raise ValueError(f"Error reading text file: {str(e)}")
    
    def _extract_steps(self, text: str) -> List[str]:
        """Extract step-by-step instructions"""
        import re
        
        # Pattern for numbered steps
        numbered_steps = re.findall(r'(?:^|\n)(\d+\.\s+.*?)(?=\n\d+\.|\n\n|\Z)', text, re.MULTILINE | re.DOTALL)
        
        # Pattern for lettered steps
        lettered_steps = re.findall(r'(?:^|\n)([a-z]\.\s+.*?)(?=\n[a-z]\.|\n\n|\Z)', text, re.MULTILINE | re.DOTALL)
        
        # Pattern for bullet points
        bullet_steps = re.findall(r'(?:^|\n)([-*•]\s+.*?)(?=\n[-*•]|\n\n|\Z)', text, re.MULTILINE | re.DOTALL)
        
        all_steps = numbered_steps + lettered_steps + bullet_steps
        return [step.strip() for step in all_steps if step.strip()]
    
    def _extract_safety_notes(self, text: str) -> List[str]:
        """Extract safety-related information"""
        import re
        
        safety_patterns = [
            r'(?i)(?:warning|caution|danger|safety|hazard|risk)[:\s]+(.*?)(?=\n|$)',
            r'(?i)(?:⚠️|🚨|⚡|☢️|☣️)\s*(.*?)(?=\n|$)',
            r'(?i)(?:important|critical|essential)[:\s]+(.*?)(?=\n|$)'
        ]
        
        safety_notes = []
        for pattern in safety_patterns:
            matches = re.findall(pattern, text, re.MULTILINE | re.DOTALL)
            safety_notes.extend([match.strip() for match in matches if match.strip()])
        
        return safety_notes
    
    def get_document_summary(self, file_path: str) -> Dict:
        """Get document summary without full processing"""
        try:
            file_stat = os.stat(file_path)
            file_ext = Path(file_path).suffix.lower()
            
            return {
                'filename': Path(file_path).name,
                'file_type': file_ext,
                'file_size_mb': round(file_stat.st_size / (1024 * 1024), 2),
                'last_modified': file_stat.st_mtime,
                'is_supported': file_ext in self.allowed_extensions
            }
        except Exception as e:
            logger.error(f"Error getting document summary: {str(e)}")
            return {}
