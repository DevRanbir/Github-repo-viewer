import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { animate } from 'animejs';
import './ProjectCard.css';

interface ProjectCardProps {
  name: string;
  description: string;
  language: string;
  htmlUrl: string;
  homepage?: string;
  topics: string[];
  username: string;
  hasHtmlFile: boolean;
  updatedAt: string;
  stargazers: number;
  forks: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  description,
  language,
  htmlUrl,
  homepage,
  topics,
  username,
  hasHtmlFile,
}) => {
  const [showTerminal, setShowTerminal] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);
  
  // Function to check if a website URL exists based on GitHub Pages pattern
  const getGitHubPagesUrl = () => {
    if (homepage) return homepage;
    if (hasHtmlFile) return `https://${username}.github.io/${name}/`;
    return null;
  };
  
  const gitHubPagesUrl = getGitHubPagesUrl();
  
  const handleRunCode = () => {
    setShowTerminal(prev => !prev);
  };
  
  const closeTerminal = () => {
    setShowTerminal(false);
  };

  useEffect(() => {
    if (showTerminal && terminalContainerRef.current) {
      // Initialize terminal if not already initialized
      if (!terminalInstance.current) {
        const terminal = new Terminal({
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          fontSize: 14,
          theme: {
            background: '#1a202c',
            foreground: '#e2e8f0',
            cursor: '#4263eb'
          },
          rows: 20,
          cols: 80,
          cursorBlink: true
        });
        
        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);
        
        // Clear previous terminal content
        terminalContainerRef.current.innerHTML = '';
        
        terminal.open(terminalContainerRef.current);
        fitAddon.fit();
        terminalInstance.current = terminal;
        
        // Terminal animation
        animate('.terminal-container', {
          opacity: [0, 1],
          height: [0, 300],
          easing: 'easeOutQuad',
          duration: 400
        });
        
        // Simulate terminal output based on language
        setTimeout(() => {
          terminal.writeln(`> Initializing ${language} project environment...`);
        }, 300);
        
        setTimeout(() => {
          terminal.writeln('> Loading dependencies...');
        }, 1000);
        
        setTimeout(() => {
          terminal.writeln('> Setting up development server...');
        }, 2000);
        
        let runCommand = 'start';
        if (language === 'Python') runCommand = 'python main.py';
        else if (language === 'Java') runCommand = 'java Main';
        else if (language === 'C++' || language === 'C') runCommand = './run';
        else if (language === 'JavaScript') runCommand = 'npm start';
        else if (language === 'TypeScript') runCommand = 'npm start';
        
        setTimeout(() => {
          terminal.writeln(`> Project ready! Running ${name} with ${language}...`);
          terminal.writeln('');
          terminal.writeln(`$ ${runCommand}`);
          terminal.writeln('');
        }, 3000);
        
        // Add simulated output based on language
        setTimeout(() => {
          if (language === 'Python') {
            terminal.writeln('Starting application...');
            terminal.writeln('Loaded modules successfully');
            terminal.writeln(`Welcome to ${name}!`);
            terminal.writeln('Type "help" for available commands');
            terminal.writeln('> ');
          } else if (language === 'JavaScript' || language === 'TypeScript') {
            terminal.writeln('Compiled successfully!');
            terminal.writeln('');
            terminal.writeln('You can now view the app in the browser.');
            terminal.writeln('');
            terminal.writeln('  Local:            http://localhost:3000');
            terminal.writeln('  On Your Network:  http://192.168.1.5:3000');
            terminal.writeln('');
            terminal.writeln('Note that the development build is not optimized.');
            terminal.writeln('To create a production build, use npm run build.');
            terminal.writeln('');
          } else {
            terminal.writeln(`${name} started successfully!`);
            terminal.writeln('Ready for input...');
            terminal.writeln('> ');
          }
          
          // Add user input capability
          let userInput = '';
          terminal.onKey(({ key, domEvent }) => {
            if (domEvent.keyCode === 13) { // Enter key
              terminal.writeln('');
              if (userInput.trim().toLowerCase() === 'exit') {
                terminal.writeln('Closing session...');
                setTimeout(() => {
                  closeTerminal();
                }, 1000);
              } else if (userInput.trim().toLowerCase() === 'help') {
                terminal.writeln('Available commands:');
                terminal.writeln('  help - Display this help menu');
                terminal.writeln('  exit - Close the terminal');
                terminal.writeln('  clear - Clear the terminal');
                terminal.writeln(`  info - Show info about ${name}`);
                terminal.writeln('> ');
              } else if (userInput.trim().toLowerCase() === 'clear') {
                terminal.clear();
                terminal.writeln('> ');
              } else if (userInput.trim().toLowerCase() === 'info') {
                terminal.writeln(`Project: ${name}`);
                terminal.writeln(`Language: ${language}`);
                terminal.writeln(`Topics: ${topics.join(', ')}`);
                terminal.writeln('> ');
              } else if (userInput.trim() !== '') {
                terminal.writeln(`Command not recognized: ${userInput}`);
                terminal.writeln('Type "help" for available commands');
                terminal.writeln('> ');
              } else {
                terminal.writeln('> ');
              }
              userInput = '';
            } else if (domEvent.keyCode === 8) { // Backspace
              if (userInput.length > 0) {
                userInput = userInput.slice(0, -1);
                // Move cursor back and clear character
                terminal.write('\b \b');
              }
            } else {
              userInput += key;
              terminal.write(key);
            }
          });
        }, 4000);
      }
    } else if (!showTerminal && terminalInstance.current) {
      // Close and dispose terminal when hiding
      terminalInstance.current.dispose();
      terminalInstance.current = null;
    }
  }, [showTerminal, language, name, topics]);

  // Add hover animation
  useEffect(() => {
    if (cardRef.current) {
      const card = cardRef.current;
      
      const handleMouseEnter = () => {
        animate('.project-card', {
          scale: 1.03,
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.15)',
          easing: 'easeOutElastic(1, .8)',
          duration: 800
        });
      };
      
      const handleMouseLeave = () => {
        animate('.project-card', {
          scale: 1,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          easing: 'easeOutQuad',
          duration: 400
        });
      };
      
      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        card.removeEventListener('mouseenter', handleMouseEnter);
        card.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  return (
    <div className="project-card" ref={cardRef}>
      <h3>{name}</h3>
      <p>{description}</p>
      <div className="project-info">
        {language && (
          <span className="language" data-language={language}>{language}</span>
        )}
        <div className="topics">
          {topics.slice(0, 3).map((topic) => (
            <span key={topic} className="topic">{topic}</span>
          ))}
          {topics.length > 3 && (
            <span className="topic">+{topics.length - 3}</span>
          )}
        </div>
      </div>
      <div className="project-actions">
        <a 
          href={htmlUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="github-button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: '6px' }}>
            <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
          </svg>
          GitHub
        </a>
        {gitHubPagesUrl ? (
          <a
            href={gitHubPagesUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className="demo-button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Live Web
          </a>
        ) : language ? (
          <button
            onClick={handleRunCode}
            className={`demo-button ${showTerminal ? 'active' : ''}`}
          >
            {!showTerminal ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <polyline points="5 8 9 12 5 16"></polyline>
                  <line x1="9" y1="12" x2="19" y2="12"></line>
                </svg>
                Run Code
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Close Terminal
              </>
            )}
          </button>
        ) : null}
      </div>
      {showTerminal && (
        <div className="terminal-wrapper">
          <div className="terminal-header">
            <div className="terminal-title">{name} Terminal</div>
            <button className="terminal-close-button" onClick={closeTerminal}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div ref={terminalContainerRef} className="terminal-container" />
        </div>
      )}
    </div>
  );
};

export default ProjectCard;