let emailText = null;

//Retrieves the OAuth 2.0 token for authentication with Google APIs with scope like Fetching the email and profile information
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
          'https://www.googleapis.com/auth/gmail.readonly',
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

// Listener for messages from other parts of the extension
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  const { action } = message;
  switch (action) {
    case 'getMessageDetails':
      // Fetches the details of a specific Gmail message with the help of OAuth 2.0 token
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
        console.log('Error fetching message details:', error);
      }
      break;

    case 'checkAuthentication':
      // Checks if the user is authenticated and sends the status to the content script
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
      // Executes an action when a specific button is clicked
      const token = await getAuthToken();
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab && tab.id) {
        if (token) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'getMessageText',
            token,
          });
          clickHandler();
        }
      }
      break;

    case 'clickReplyButton': // This will auto click the reply button when we click our extension mailMinder button
    case 'suggestedText': // This paste the replies that are generated from OpenAi into the Reply Box
    case 'closeIframe': // This will close the iframe
      // Handles various user actions by forwarding messages to the content script
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

// Handler for simulating a click action and sending the email text to the content script.
const clickHandler = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  if (activeTab && activeTab.id) {
    chrome.tabs.sendMessage(activeTab.id, { action: 'clickReplyButton' });
    setTimeout(() => { // TimeOut here as it takes some time to get the emailText with googleapis 
      if (activeTab && activeTab.id)
        chrome.tabs.sendMessage(activeTab.id, {
          action: 'receiveEmailText', // This send the email text to the MainModel to generate response with AI
          response: emailText,
        });
    }, 1000);
  } else {
    console.log('API response does not contain result or No Active Tab');
  }
};
