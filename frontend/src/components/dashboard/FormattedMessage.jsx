import React from 'react';
import { ExternalLink, FileText, AlertCircle, CheckCircle, Info } from 'lucide-react';

const FormattedMessage = ({ message }) => {
  if (!message) {
    return null;
  }

  // Function to format text with basic markdown-like formatting
  const formatText = (text) => {
    if (!text) return '';
    
    // Split text into lines for processing
    const lines = text.split('\n');
    const formattedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Skip empty lines but preserve spacing
      if (line.trim() === '') {
        formattedLines.push(<br key={i} />);
        continue;
      }
      
      // Headers (lines starting with #)
      if (line.startsWith('###')) {
        formattedLines.push(
          <h4 key={i} className="font-semibold text-sm mt-3 mb-1 text-gray-800">
            {line.replace(/^###\s*/, '')}
          </h4>
        );
        continue;
      }
      
      if (line.startsWith('##')) {
        formattedLines.push(
          <h3 key={i} className="font-semibold text-base mt-3 mb-1 text-gray-800">
            {line.replace(/^##\s*/, '')}
          </h3>
        );
        continue;
      }
      
      if (line.startsWith('#')) {
        formattedLines.push(
          <h2 key={i} className="font-bold text-lg mt-3 mb-2 text-gray-900">
            {line.replace(/^#\s*/, '')}
          </h2>
        );
        continue;
      }
      
      // Bullet points
      if (line.match(/^[\s]*[-*•]\s/)) {
        const indent = line.match(/^(\s*)/)[1].length;
        const content = line.replace(/^[\s]*[-*•]\s/, '');
        formattedLines.push(
          <div key={i} className={`flex items-start mt-1 ${indent > 0 ? 'ml-4' : ''}`}>
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
            <span className="text-sm">{formatInlineText(content)}</span>
          </div>
        );
        continue;
      }
      
      // Numbered lists
      if (line.match(/^[\s]*\d+\.\s/)) {
        const indent = line.match(/^(\s*)/)[1].length;
        const match = line.match(/^[\s]*(\d+)\.\s(.+)/);
        if (match) {
          const [, number, content] = match;
          formattedLines.push(
            <div key={i} className={`flex items-start mt-1 ${indent > 0 ? 'ml-4' : ''}`}>
              <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mr-2 flex-shrink-0 mt-0.5">
                {number}
              </span>
              <span className="text-sm">{formatInlineText(content)}</span>
            </div>
          );
          continue;
        }
      }
      
      // Code blocks (lines starting with ```)
      if (line.startsWith('```')) {
        // Find the end of code block
        let codeContent = [];
        i++; // Skip the opening ```
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeContent.push(lines[i]);
          i++;
        }
        formattedLines.push(
          <pre key={i} className="bg-gray-100 rounded p-2 mt-2 mb-2 text-xs font-mono overflow-x-auto">
            <code>{codeContent.join('\n')}</code>
          </pre>
        );
        continue;
      }
      
      // Quote blocks (lines starting with >)
      if (line.startsWith('>')) {
        const content = line.replace(/^>\s*/, '');
        formattedLines.push(
          <blockquote key={i} className="border-l-4 border-blue-500 pl-3 mt-2 mb-2 text-sm text-gray-700 italic bg-blue-50 py-2 rounded-r">
            {formatInlineText(content)}
          </blockquote>
        );
        continue;
      }
      
      // Warning/Alert blocks (lines starting with WARNING:, CAUTION:, etc.)
      if (line.match(/^(WARNING|CAUTION|ALERT|DANGER|NOTE|IMPORTANT):/i)) {
        const type = line.match(/^(WARNING|CAUTION|ALERT|DANGER|NOTE|IMPORTANT):/i)[1].toUpperCase();
        const content = line.replace(/^(WARNING|CAUTION|ALERT|DANGER|NOTE|IMPORTANT):\s*/i, '');
        let bgColor = 'bg-yellow-50 border-yellow-400 text-yellow-800';
        let icon = AlertCircle;
        
        if (type === 'DANGER' || type === 'WARNING') {
          bgColor = 'bg-red-50 border-red-400 text-red-800';
        } else if (type === 'NOTE' || type === 'IMPORTANT') {
          bgColor = 'bg-blue-50 border-blue-400 text-blue-800';
          icon = Info;
        }
        
        const Icon = icon;
        
        formattedLines.push(
          <div key={i} className={`border-l-4 pl-3 pr-3 py-2 mt-2 mb-2 rounded-r ${bgColor}`}>
            <div className="flex items-start space-x-2">
              <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-sm">{type}:</span>
                <span className="text-sm ml-1">{formatInlineText(content)}</span>
              </div>
            </div>
          </div>
        );
        continue;
      }
      
      // Step indicators (lines starting with Step 1:, Step 2:, etc.)
      if (line.match(/^Step\s+\d+:/i)) {
        const match = line.match(/^Step\s+(\d+):\s*(.+)/i);
        if (match) {
          const [, stepNumber, content] = match;
          formattedLines.push(
            <div key={i} className="flex items-start mt-2 mb-2 p-2 bg-green-50 border-l-4 border-green-500 rounded-r">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-green-600 text-white text-xs font-bold rounded-full mr-3 flex-shrink-0">
                {stepNumber}
              </span>
              <span className="text-sm font-medium text-green-800">{formatInlineText(content)}</span>
            </div>
          );
          continue;
        }
      }
      
      // Regular paragraphs
      formattedLines.push(
        <p key={i} className="text-sm leading-relaxed mb-2">
          {formatInlineText(line)}
        </p>
      );
    }
    
    return formattedLines;
  };
  
  // Function to format inline text (bold, italic, code, links)
  const formatInlineText = (text) => {
    // Handle **bold**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle *italic*
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle `code`
    text = text.replace(/`(.*?)`/g, '<code class="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">$1</code>');
    
    // Handle URLs
    text = text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>'
    );
    
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };
  
  // Render confidence indicator
  const renderConfidenceIndicator = (confidence) => {
    if (!confidence) return null;
    
    const percentage = Math.round(confidence * 100);
    let color = 'text-gray-500';
    let icon = Info;
    
    if (percentage >= 90) {
      color = 'text-green-600';
      icon = CheckCircle;
    } else if (percentage >= 70) {
      color = 'text-blue-600';
      icon = Info;
    } else {
      color = 'text-orange-600';
      icon = AlertCircle;
    }
    
    const Icon = icon;
    
    return (
      <div className={`flex items-center space-x-1 ${color}`}>
        <Icon className="h-3 w-3" />
        <span className="text-xs font-medium">{percentage}% confidence</span>
      </div>
    );
  };
  
  // Render sources with better formatting
  const renderSources = (sources) => {
    if (!sources || sources.length === 0) return null;
    
    return (
      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-1 mb-2">
          <FileText className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-800">Referenced Sources</span>
        </div>
        <div className="space-y-2">
          {sources.map((source, index) => (
            <div key={index} className="flex items-start space-x-3">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex-shrink-0 mt-0.5">
                {index + 1}
              </span>
              <div className="flex-1">
                <span className="text-sm text-gray-800 leading-relaxed block">{source}</span>
                {/* Extract document name if source contains file reference */}
                {source.includes('.pdf') || source.includes('.docx') || source.includes('.txt') || source.includes('.md') ? (
                  <div className="flex items-center space-x-1 mt-1">
                    <ExternalLink className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-blue-600 font-medium">
                      Document Reference
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const {
    text = '',
    sources,
    confidence,
    intent,
    usage,
    timestamp,
  } = message;

  return (
    <div>
      {/* Main message content */}
      <div className="formatted-message">
        {formatText(text)}
      </div>
      
      {/* Sources section */}
      {renderSources(sources)}
      
      {/* Footer with confidence and metadata */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          {renderConfidenceIndicator(confidence)}
          {intent && (
            <div className="flex items-center space-x-1">
              <Info className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {intent.type || 'query'}
              </span>
            </div>
          )}
          {usage && usage.total_tokens && (
            <span className="text-xs text-gray-400">
              {usage.total_tokens} tokens
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500 font-medium">
          {timestamp}
        </span>
      </div>
    </div>
  );
};

export default FormattedMessage;
