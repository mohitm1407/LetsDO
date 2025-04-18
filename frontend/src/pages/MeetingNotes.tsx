import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axios from 'axios';
import './MeetingNotes.css';

interface Meeting {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}

interface MeetingNote {
  id?: number;
  meetingId: number;
  content: string;
  lastUpdated: string;
}

// Define types for code component props
interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

function MeetingNotes() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const meetingData = location.state?.meeting as Meeting;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [meeting, setMeeting] = useState<Meeting | null>(meetingData || null);
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [isAutoSave, setIsAutoSave] = useState<boolean>(true);
  
  useEffect(() => {
    if (!meeting && meetingId) {
      // If meeting data wasn't passed in location state, fetch it
      fetchMeeting(parseInt(meetingId));
    }
    
    if (meetingId) {
      fetchNotes(parseInt(meetingId));
    }
  }, [meetingId, meeting]);
  
  // Auto-save effect
  useEffect(() => {
    let autoSaveTimer: number | null = null;
    
    if (isAutoSave && notes.trim() && meetingId) {
      autoSaveTimer = window.setTimeout(() => {
        saveNotes();
      }, 5000); // Auto-save after 5 seconds of inactivity
    }
    
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [notes, isAutoSave]);
  
  const fetchMeeting = (id: number) => {
    // Mock API call - replace with actual endpoint when available
    // Using mock data for now
    const mockMeeting = {
      id: id,
      title: 'Sample Meeting',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      description: 'This is a sample meeting'
    };
    
    setMeeting(mockMeeting);
  };
  
  const fetchNotes = (meetingId: number) => {
    // Mock API call - replace with actual endpoint when available
    // Using mock data for now
    const savedNotes = localStorage.getItem(`meeting_notes_${meetingId}`);
    if (savedNotes) {
      const noteData = JSON.parse(savedNotes) as MeetingNote;
      setNotes(noteData.content);
      setLastSaved(new Date(noteData.lastUpdated).toLocaleString());
    }
  };
  
  const saveNotes = () => {
    if (!meetingId || !notes.trim()) return;
    
    setIsSaving(true);
    
    // Mock API call - replace with actual endpoint when available
    // using localStorage for demo
    const noteData: MeetingNote = {
      meetingId: parseInt(meetingId),
      content: notes,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(`meeting_notes_${meetingId}`, JSON.stringify(noteData));
    
    // Simulate API call delay
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date().toLocaleString());
    }, 600);
  };
  
  const handleBack = () => {
    navigate('/calendar');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert tab at cursor or at the beginning of each selected line
      if (start === end) {
        const newValue = notes.substring(0, start) + '  ' + notes.substring(end);
        setNotes(newValue);
        // Set cursor position after the inserted tab
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      } else {
        // For selections, add tabs at the beginning of each line
        const selectedText = notes.substring(start, end);
        const lines = selectedText.split('\n');
        const indentedText = lines.map(line => '  ' + line).join('\n');
        const newValue = notes.substring(0, start) + indentedText + notes.substring(end);
        setNotes(newValue);
        
        // Adjust selection to include the new indentation
        setTimeout(() => {
          textarea.selectionStart = start;
          textarea.selectionEnd = start + indentedText.length;
        }, 0);
      }
    }
    
    // Auto-insert list items when Enter is pressed
    if (e.key === 'Enter') {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const currentLine = notes.substring(0, start).split('\n').pop() || '';
      
      // Check for unordered list
      const unorderedListMatch = currentLine.match(/^(\s*)([-*+])\s+(.*)$/);
      if (unorderedListMatch) {
        const [, spaces, marker, text] = unorderedListMatch;
        if (text.trim() === '') {
          // Empty list item, remove it and break out of the list
          e.preventDefault();
          const beforeCursor = notes.substring(0, start - (spaces + marker + ' ').length);
          const afterCursor = notes.substring(start);
          setNotes(beforeCursor + afterCursor);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = beforeCursor.length;
          }, 0);
        } else {
          // Continue list with a new bullet point
          e.preventDefault();
          const newLine = `\n${spaces}${marker} `;
          const newValue = notes.substring(0, start) + newLine + notes.substring(start);
          setNotes(newValue);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + newLine.length;
          }, 0);
        }
      }
      
      // Check for ordered list
      const orderedListMatch = currentLine.match(/^(\s*)(\d+)\.(\s+)(.*)$/);
      if (orderedListMatch) {
        const [, spaces, num, spacesAfter, text] = orderedListMatch;
        if (text.trim() === '') {
          // Empty list item, remove it and break out of the list
          e.preventDefault();
          const beforeCursor = notes.substring(0, start - (spaces + num + '.' + spacesAfter).length);
          const afterCursor = notes.substring(start);
          setNotes(beforeCursor + afterCursor);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = beforeCursor.length;
          }, 0);
        } else {
          // Continue list with next number
          e.preventDefault();
          const nextNum = parseInt(num) + 1;
          const newLine = `\n${spaces}${nextNum}.${spacesAfter}`;
          const newValue = notes.substring(0, start) + newLine + notes.substring(start);
          setNotes(newValue);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + newLine.length;
          }, 0);
        }
      }
    }
  };

  const insertCodeBlock = () => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notes.substring(start, end);
    
    const codeBlock = `\`\`\`js\n${selectedText || 'Your code here'}\n\`\`\``;
    const newValue = notes.substring(0, start) + codeBlock + notes.substring(end);
    
    setNotes(newValue);
    setTimeout(() => {
      textarea.focus();
      if (!selectedText) {
        textarea.selectionStart = start + 5;
        textarea.selectionEnd = start + 19;
      } else {
        textarea.selectionStart = start + codeBlock.length;
        textarea.selectionEnd = start + codeBlock.length;
      }
    }, 0);
  };
  
  const insertList = (type: 'ordered' | 'unordered') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notes.substring(start, end);
    const lines = selectedText.split('\n');
    
    let formattedText = '';
    if (type === 'unordered') {
      formattedText = lines.map((line, idx) => `- ${line}`).join('\n');
    } else {
      formattedText = lines.map((line, idx) => `${idx + 1}. ${line}`).join('\n');
    }
    
    // If nothing was selected, insert placeholder
    if (!selectedText) {
      formattedText = type === 'unordered' ? 
        "- Item 1\n- Item 2\n- Item 3" : 
        "1. Item 1\n2. Item 2\n3. Item 3";
    }
    
    const newValue = notes.substring(0, start) + formattedText + notes.substring(end);
    setNotes(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
    }, 0);
  };
  
  const formatText = (type: 'bold' | 'italic' | 'heading') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notes.substring(start, end);
    
    let formattedText = '';
    let selectionStart = 0;
    let selectionEnd = 0;
    
    switch (type) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        selectionStart = selectedText ? start + 2 : start + 2;
        selectionEnd = selectedText ? end + 2 : start + 10;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        selectionStart = selectedText ? start + 1 : start + 1;
        selectionEnd = selectedText ? end + 1 : start + 11;
        break;
      case 'heading':
        formattedText = `\n## ${selectedText || 'Heading'}\n`;
        selectionStart = selectedText ? start + 4 : start + 4;
        selectionEnd = selectedText ? end + 4 : start + 10;
        break;
    }
    
    const newValue = notes.substring(0, start) + formattedText + notes.substring(end);
    setNotes(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = selectionStart;
      textarea.selectionEnd = selectionEnd;
    }, 0);
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (!meeting) {
    return <div className="loading-container">Loading meeting details...</div>;
  }
  
  return (
    <div className="meeting-notes-container">
      <div className="meeting-notes-header">
        <button className="back-button" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i> Back to Calendar
        </button>
        
        <div className="meeting-title-section">
          <h1>{meeting.title}</h1>
          <div className="meeting-details">
            <span className="meeting-date">
              <i className="fas fa-calendar-day"></i> {formatDate(meeting.date)}
            </span>
            <span className="meeting-time">
              <i className="fas fa-clock"></i> {meeting.startTime} - {meeting.endTime}
            </span>
          </div>
        </div>
        
        <div className="save-status">
          <div className="auto-save-toggle">
            <input 
              type="checkbox" 
              id="auto-save" 
              checked={isAutoSave} 
              onChange={() => setIsAutoSave(!isAutoSave)} 
            />
            <label htmlFor="auto-save">Auto-save</label>
          </div>
          {lastSaved && <span className="last-saved">Last saved: {lastSaved}</span>}
          <button 
            className="save-button" 
            onClick={saveNotes}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> Save Notes
              </>
            )}
          </button>
        </div>
      </div>
      
      {meeting.description && (
        <div className="meeting-description">
          <h3>Meeting Description</h3>
          <p>{meeting.description}</p>
        </div>
      )}
      
      <div className="notes-tools">
        <div className="format-tools">
          <button onClick={() => formatText('bold')} title="Bold Text">
            <i className="fas fa-bold"></i>
          </button>
          <button onClick={() => formatText('italic')} title="Italic Text">
            <i className="fas fa-italic"></i>
          </button>
          <button onClick={() => formatText('heading')} title="Heading">
            <i className="fas fa-heading"></i>
          </button>
          <div className="tool-divider"></div>
          <button onClick={() => insertList('unordered')} title="Unordered List">
            <i className="fas fa-list-ul"></i>
          </button>
          <button onClick={() => insertList('ordered')} title="Ordered List">
            <i className="fas fa-list-ol"></i>
          </button>
          <div className="tool-divider"></div>
          <button onClick={insertCodeBlock} title="Code Block">
            <i className="fas fa-code"></i>
          </button>
        </div>
        <div className="view-toggle">
          <button 
            className={`view-btn ${!previewMode ? 'active' : ''}`}
            onClick={() => setPreviewMode(false)}
          >
            Edit
          </button>
          <button 
            className={`view-btn ${previewMode ? 'active' : ''}`}
            onClick={() => setPreviewMode(true)}
          >
            Preview
          </button>
        </div>
      </div>
      
      <div className="notes-section">
        <h2>Meeting Notes</h2>
        
        <div className={`notes-content ${previewMode ? 'preview-mode' : 'edit-mode'}`}>
          {previewMode ? (
            <div className="markdown-preview">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({node, inline, className, children, ...props}: CodeProps) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={atomDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {notes}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              className="notes-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="# Meeting Notes

Type your notes here using Markdown formatting...

## Example

- Use **bold** or *italic* for emphasis
- Create lists with hyphens or numbers
- Add code with \`backticks\` or code blocks

```js
// Code block example
console.log('Hello World');
```
"
            ></textarea>
          )}
        </div>
      </div>
    </div>
  );
}

export default MeetingNotes; 