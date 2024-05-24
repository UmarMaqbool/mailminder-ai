import React, { useEffect } from 'react';

function App() {
  const containerStyle = {
    backgroundColor: '#fffff',
    padding: '20px',
    width: '325px',
    margin: '-12px',
    fontFamily: 'Arial, sans-serif',
  };

  const headingStyle = {
    color: '#333',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    marginTop: '10px',
    marginLeft: '12px',
  };

  const header = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  };

  const logoHeader = {
    display: 'flex',
    alignItems: 'center',
  };

  const headDivider = {
    width: '100%',
    border: 'none',
    borderBottom: '1px solid #ccc',
    margin: '18px 0px 6px 0px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const onButtonClick = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id || 0, '');
  };

  return (
    <div style={containerStyle}>
        <div style={header}>
          <div style={logoHeader}>
            <img
              src="https://media.licdn.com/dms/image/D4D0BAQGd8H31h5niqg/company-logo_200_200/0/1712309492132/evolvebay_logo?e=2147483647&v=beta&t=tSYT6EkXf7aP709xw1DbPc41AbobGq6qtM5PC1El__I"
              height={'28px'}
              width={'28px'}
              style={{ borderRadius: '50%' }}
            ></img>
            <p style={headingStyle}>EvolveBay</p>
          </div>
        </div>
        <hr style={headDivider} />
    </div>
  );
}

export default App;
