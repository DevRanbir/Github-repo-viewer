import React, { useState } from 'react';
import './App.css';
import PortfolioContent from './components/PortfolioContent';
import ProfileSidebar from './components/ProfileSidebar';
import ThemeSwitcher from './components/ThemeSwitcher';

function App() {
  const defaultUsername = "devranbir";
  const [username, setUsername] = useState(defaultUsername);

  const handleUserSwitch = () => {
    const newUsername = prompt("Enter GitHub username to view their portfolio:");
    if (newUsername) {
      setUsername(newUsername.trim());
    }
  };

  return (
    <div className="App">
      <div className="user-switch">
        <button onClick={handleUserSwitch} className="switch-user-btn">
          🔎
        </button>
      </div>
      <div className="split-layout">
        <ProfileSidebar username={username} />
        <main>
          <PortfolioContent username={username} />
        </main>
      </div>
      <ThemeSwitcher />
    </div>
  );
}

export default App;