let emailText = null;
export async function getAuthToken(): Promise<string | undefined> {
  return new Promise((resolve) => {
    chrome?.identity?.getAuthToken(
      {
        interactive: true,
        scopes: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile',
        ],
      },
      (token) => {
        if (token) {
          console.log('Token:', token);
          resolve(token);
        } else {
          console.error('Error obtaining token:', chrome.runtime.lastError);
          resolve(undefined);
        }
      }
    );
  });
}

chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (message.action === 'getMessageDetails') {
    const { messageId, accessToken } = message;
    try {
      const response = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const messageDetails = await response.json();
      emailText = messageDetails.snippet;
    } catch (error) {
      console.error('Error fetching message details:', error);
    }
  }
});


chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  try {
    const [tab] = await chrome?.tabs?.query({
      active: true,
      currentWindow: true,
    });
    if (tab && tab.id) {
      clickHandler();
    }
  } catch (error) {
    console.log('Error querying tabs:', error);
  }
});

const clickHandler = async () => {
  const tabs = await chrome?.tabs?.query({
    active: true,
    currentWindow: true,
  });
  const activeTab = tabs[0];
  if (activeTab && activeTab.id) {
    chrome.tabs.sendMessage(activeTab.id, { action: 'clickReplyButton' });
    setTimeout(() => {
      if (activeTab && activeTab.id)
        chrome.tabs.sendMessage(activeTab.id, {
          action: 'receiveEmailText',
          response: emailText,
        });
    }, 500);
  } else {
    console.log('API response does not contain result or No Active Tab');
  }
};

chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (message.action === 'generateEmailText') {
    const suggestedText = message.selectedTone;
    const tabs = await chrome?.tabs?.query({
      active: true,
      currentWindow: true,
    });
    const activeTab = tabs[0];
    if (activeTab && activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, {
        action: 'generateEmailText',
        suggestedText: suggestedText,
      });
    }
  }
});

chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (message.action === 'suggestedText') {
    const suggestedText = message.suggestion;
    const tabs = await chrome?.tabs?.query({
      active: true,
      currentWindow: true,
    });
    const activeTab = tabs[0];
    if (activeTab && activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, {
        action: 'suggestedText',
        suggestedText: suggestedText,
      });
    }
  }
});

chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (message.action === 'closeIframe') {
    const tabs = await chrome?.tabs?.query({
      active: true,
      currentWindow: true,
    });
    const activeTab = tabs[0];
    if (activeTab && activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, { action: 'closeIframe' });
    }
  }
});

chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (message.action === 'authenticateWithGoogle') {
    const token = await getAuthToken();
    if (!chrome.runtime.lastError && token) {
      if (sender?.tab?.id)
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'handleAuthToken',
          token: token,
        });
    } else {
      console.error('Error obtaining token:', chrome.runtime.lastError);
    }
  }
});
