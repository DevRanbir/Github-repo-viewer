import React, { useEffect, useState } from 'react';
import './RepoContentViewer.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface RepoContentViewerProps {
  username: string;
  repoName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface RepoContent {
  type: string;
  name: string;
  path: string;
  sha: string;
  content?: string;
  encoding?: string;
  size?: number;
  url?: string;
}

const RepoContentViewer: React.FC<RepoContentViewerProps> = ({
  username,
  repoName,
  isOpen,
  onClose
}) => {
  const [contents, setContents] = useState<RepoContent[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<RepoContent | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRepoContents();
    }
  }, [isOpen, currentPath]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('github_token');
    return {
      Accept: 'application/vnd.github.v3+json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  };

  const fetchRepoContents = async () => {
    try {
      setLoading(true);
      setSelectedFile(null);
      setFileContent('');
      
      const response = await fetch(
        `https://api.github.com/repos/${username}/${repoName}/contents/${currentPath}`,
        { headers: getAuthHeaders() }
      );
      if (!response.ok) throw new Error('Failed to fetch repository contents');
      const data = await response.json();
      const contents = Array.isArray(data) ? data : [data];
      setContents(contents);

      // Check for README file if we're at the root level and no file is selected
      if (currentPath === '' && !selectedFile) {
        const readmeFile = contents.find(item => 
          item.type === 'file' && 
          item.name.toLowerCase().startsWith('readme')
        );
        if (readmeFile) {
          fetchFileContent(readmeFile);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching contents');
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (file: RepoContent) => {
    try {
      setLoading(true);
      const response = await fetch(file.url!, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch file content');
      
      try {
        // For markdown files, get raw content
        if (file.name.toLowerCase().endsWith('.md')) {
          const content = await response.text();
          setFileContent(content);
        } else {
          // For other files, handle potential base64 encoding
          const data = await response.json();
          if (data.encoding === 'base64' && data.content) {
            // Decode base64 content
            const decodedContent = atob(data.content.replace(/\n/g, ''));
            setFileContent(decodedContent);
          } else {
            // Fallback for non-encoded content
            setFileContent(data.content || '');
          }
        }
        
        setSelectedFile(file);
      } catch (parseErr) {
        // If there's an error parsing the content, don't show the file
        setError(`Unable to display this file: ${file.name}`);
        setSelectedFile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching file content');
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (path: string) => {
    setCurrentPath(path);
  };

  const goBack = () => {
    if (error) {
      // Clear error state when going back from an error
      setError(null);
      // If we were trying to view a file, just clear the selection
      if (selectedFile) {
        setSelectedFile(null);
        setFileContent('');
      }
      // Otherwise, refresh the current directory contents
      else {
        fetchRepoContents();
      }
    } else if (selectedFile) {
      setSelectedFile(null);
      setFileContent('');
    } else {
      const newPath = currentPath.split('/').slice(0, -1).join('/');
      setCurrentPath(newPath);
    }
  };

  const handleItemClick = (item: RepoContent) => {
    if (item.type === 'dir') {
      navigateToFolder(item.path);
    } else {
      fetchFileContent(item);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (!isOpen) return null;

  const processMarkdownContent = (content: string) => {
    // Replace relative image paths with absolute GitHub URLs
    return content.replace(
      /!\[([^\]]*)\]\((?!http)([^\)]*)\)/g,
      `![$1](https://raw.githubusercontent.com/${username}/${repoName}/main/$2)`
    );
  };

  const renderFileContent = () => {
    if (!selectedFile) return null;

    if (selectedFile.name.toLowerCase().endsWith('.md')) {
      return (
        <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({ node, ...props }) => (
                <img style={{ maxWidth: '100%' }} {...props} alt={props.alt || ''} />
              ),
              a: ({ node, ...props }) => (
                <a target="_blank" rel="noopener noreferrer" {...props} />
              )
            }}
          >
            {processMarkdownContent(fileContent)}
          </ReactMarkdown>
        </div>
      );
    }

    return (
      <pre>
        <code>{fileContent}</code>
      </pre>
    );
  };

  return (
    <div className="repo-content-viewer-overlay">
      <div className="repo-content-viewer">
        <div className="repo-content-header">
          <div className="header-content">
            <button 
              className="toggle-sidebar-button" 
              onClick={toggleSidebar}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                {isSidebarCollapsed ? (
                  <path d="M6 2.75A.75.75 0 016.75 2h6.5a.75.75 0 010 1.5h-6.5A.75.75 0 016 2.75zm0 5A.75.75 0 016.75 7h6.5a.75.75 0 010 1.5h-6.5A.75.75 0 016 7.75zm0 5A.75.75 0 016.75 12h6.5a.75.75 0 010 1.5h-6.5a.75.75 0 01-.75-.75z" />
                ) : (
                  <path d="M2.75 2a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H2.75zM2 7.75A.75.75 0 012.75 7h10.5a.75.75 0 010 1.5H2.75A.75.75 0 012 7.75zm0 5A.75.75 0 012.75 12h10.5a.75.75 0 010 1.5H2.75A.75.75 0 012 12.75z" />
                )}
              </svg>
            </button>
            <h2>{repoName}</h2>
            {currentPath && <span className="path-indicator">/{currentPath}</span>}
          </div>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        
        <div className="repo-content-layout">
          <div className={`repo-content-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="content-navigation">
              {(currentPath || error) && (
                <button onClick={goBack} className="back-button">
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                    <path d="M6.78 3.22a.75.75 0 0 0-1.06 1.06L8.94 7.5 5.72 10.72a.75.75 0 1 0 1.06 1.06L9.56 8l3.78 3.78a.75.75 0 1 0 1.06-1.06L10.62 7.5l3.78-3.78a.75.75 0 0 0-1.06-1.06L9.56 7.5 6.78 3.22z"/>
                  </svg>
                  {!isSidebarCollapsed && <span>Back</span>}
                </button>
              )}
            </div>
            
            <div className="folder-contents">
              {loading ? (
                <div className="loading">Loading...</div>
              ) : error ? (
                <div className="error">
                  {error}
                  <button onClick={goBack} className="error-back-button">
                    Go back
                  </button>
                </div>
              ) : (
                <ul>
                  {contents.length === 0 ? (
                    <li className="empty-folder">This folder is empty</li>
                  ) : (
                    contents.map((item) => (
                      <li key={item.sha} className={`item ${item.type}`}>
                        <button onClick={() => handleItemClick(item)}>
                          {item.type === 'dir' ? (
                            <>
                              <svg className="icon" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                                <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z" />
                              </svg>
                              {!isSidebarCollapsed && (
                                <span>
                                  {item.name}
                                  {/* Check if folder is empty by making a request when needed */}
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <svg className="icon" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                                <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25V1.75z" />
                              </svg>
                              {!isSidebarCollapsed && <span>{item.name}</span>}
                            </>
                          )}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>
          
          <div className="content-display">
            {selectedFile ? (
              <div className="file-content">
                <h3>{selectedFile.name}</h3>
                {renderFileContent()}
              </div>
            ) : (
              <div className="empty-state">
                <p>Select a file to view its contents</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepoContentViewer;