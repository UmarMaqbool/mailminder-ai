import React from 'react';
import { getAuthToken } from './background';
import './stylesApp.css';

function App() {
  const onButtonClick = async () => {
    try {
      const token = await getAuthToken();
      const tabs = await chrome?.tabs?.query({
        active: true,
        currentWindow: true,
      });
      if (Array.isArray(tabs) && tabs.length > 0) {
        const activeTab = tabs[0];
        const gmailPattern = /https:\/\/mail\.google\.com\//;

        if (activeTab.url && gmailPattern.test(activeTab.url)) {
          chrome.tabs.sendMessage(activeTab.id || 0, '');
          setTimeout(() => {
            chrome.tabs.sendMessage(activeTab.id || 0, {
              action: 'openUserProfile',
              token: token,
            });
          }, 300);
        } else {
          const newUrl = chrome.runtime.getURL('tabInfoModel.html');
          chrome.tabs.create({ url: newUrl }, (newTab) => {
            chrome.tabs.onUpdated.addListener(function listener(
              tabId,
              changeInfo
            ) {
              if (tabId === newTab?.id && changeInfo.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                chrome.tabs.sendMessage(tabId, {
                  action: 'showUserProfile',
                  token: token,
                });
              }
            });
          });
        }
      } else {
        console.error('No active tab found');
      }
    } catch (error) {
      console.error('Error getting auth token or querying tabs: ', error);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="logo-header">
          <img
            src="https://media.licdn.com/dms/image/D4D0BAQGd8H31h5niqg/company-logo_200_200/0/1712309492132/evolvebay_logo?e=2147483647&v=beta&t=tSYT6EkXf7aP709xw1DbPc41AbobGq6qtM5PC1El__I"
            height={'28px'}
            width={'28px'}
            style={{ borderRadius: '50%' }}
            alt="EvolveBay Logo"
          ></img>
          <p className="heading">EvolveBay</p>
        </div>
        <button onClick={onButtonClick} className="profile-button">
          See Profile
        </button>
      </div>
      <hr className="head-divider" />
      <button onClick={onButtonClick} className="google-button">
        <img
          src="https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-webinar-optimizing-for-success-google-business-webinar-13.png"
          alt="Google Logo"
          className="google-logo"
        />
        Sign in with Google
      </button>
    </div>
  );
}

export default App;
