let emailText = null;

export async function getAuthToken(
  interactive = true
): Promise<string | undefined> {
  return new Promise((resolve) => {
    chrome.identity.getAuthToken(
      {
        interactive,
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
          resolve(undefined);
        }
      }
    );
  });
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  const { action } = message;
  switch (action) {
    case 'getMessageDetails':
      const { messageId, accessToken } = message;
      try {
        const response = await fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const messageDetails = await response.json();
        emailText = messageDetails.snippet;
      } catch (error) {
        console.error('Error fetching message details:', error);
      }
      break;

    case 'authenticateWithGoogle':
      const token = await getAuthToken();
      if (token) {
        if (sender.tab?.id)
          chrome.tabs.sendMessage(sender.tab.id, {
            action: 'handleAuthToken',
            token,
          });
      } else {
        console.log('Error obtaining token:', chrome.runtime.lastError);
      }
      break;

    case 'checkAuthentication':
      (async () => {
        const authToken = await getAuthToken(false);
        if (authToken) {
          if (sender.tab?.id)
            chrome.tabs.sendMessage(sender.tab.id, {
              action: 'authenticationStatus',
              authenticated: true,
              token: authToken,
            });
        } else {
          if (sender.tab?.id)
            chrome.tabs.sendMessage(sender.tab.id, {
              action: 'authenticationStatus',
              authenticated: false,
            });
        }
      })();
      break;
      
    case 'executeOnClicker':
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab && tab.id) {
        clickHandler();
      }
      break;

    case 'generateEmailText':
    case 'clickReplyButton':
    case 'suggestedText':
    case 'closeIframe':
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const activeTab = tabs[0];
      if (activeTab && activeTab.id) {
        chrome.tabs.sendMessage(activeTab.id, message);
      }
      break;
  }
});

const clickHandler = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
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
