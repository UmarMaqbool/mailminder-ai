import './styles/stylesContentScript.css';
let iframeExists = false;
let iUserProfile = false;

// Checks the authentication status by sending a message to the background script.
const checkAuthentication = async (): Promise<any> => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'checkAuthentication' });
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'authenticationStatus') {
        resolve(message);
      }
    });
  });
};

// Shows the login button in an iframe.
const showLoginButton = () => {
  const iframe = document.createElement('iframe');
  iframe.classList.add('custom-iframe');
  iframe.src = chrome.runtime.getURL('auth.html');
  document.body.appendChild(iframe);
  setTimeout(() => {
    iframe.classList.add('active');
  }, 10);
  iframeExists = true;

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'closeIframe') {
      if (iframe && iframe.parentNode) {
        iframe.classList.remove('active');
        setTimeout(() => {
          if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
            iframeExists = false;
          }
        }, 300);
      }
    }
  });
};

// This is handled in App.tsx that if user in the gmail chrome page that open this iframe there
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.action === 'openUserProfile') {
    if (!iUserProfile) {
      const iframe = document.createElement('iframe');
      iframe.classList.add('user-profile-iframe');
      iframe.src = chrome.runtime.getURL('infoModel.html');
      document.body.appendChild(iframe);
      setTimeout(() => {
        iframe.classList.add('active');
      }, 10);
      iUserProfile = true;

      const closeListener = (message: { action: string }) => {
        if (message.action === 'closeIframe') {
          if (iframe && iframe.parentNode) {
            iframe.classList.remove('active');
            setTimeout(() => {
              if (iframe && iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
                iUserProfile = false;
              }
            }, 300);
            setTimeout(() => {
              const replyButton = document.querySelector(
                '.og.T-I-J3'
              ) as HTMLElement | null;
              replyButton?.click();
            }, 10);
            iframeExists = false;
            iUserProfile = false;
          }
        }
      };
      chrome.runtime.onMessage.addListener(closeListener);
    }
  }
});

// Adds the main button to the Gmail page.
const addButtonToPage = () => {
  const mainDiv = document.querySelector('.amn');
  if (mainDiv && !document.getElementById('myInjectButton')) {
    const button = document.createElement('button');
    button.id = 'myInjectButton';
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('contentWrapper');
    const logoImg = document.createElement('img');
    logoImg.src = chrome.runtime.getURL('icons/logo_white.png');
    const buttonText = document.createTextNode('MailMinder AI');
    button.addEventListener('click', async function () {
      checkAuthentication().then((response) => {
        if (response?.authenticated) {
          chrome.runtime.sendMessage({ action: 'executeOnClicker' });
          console.log('User is authenticated');
        } else {
          console.log('User is not authenticated');
          showLoginButton();
        }
      });
    });
    contentWrapper.appendChild(logoImg);
    contentWrapper.appendChild(buttonText);
    button.appendChild(contentWrapper);
    const firstSpan = mainDiv.querySelector('span');
    if (firstSpan) {
      mainDiv.insertBefore(button, firstSpan);
    } else {
      console.log('Span not found');
    }
  }
};

/**
 * Adds the reply button to the reply section.
 */
const addButtonToReply = () => {
  const mainSmallDiv = document.querySelector('.J-J5-Ji.btA');
  if (mainSmallDiv && !document.getElementById('myInjectSmallButton')) {
    const button = document.createElement('img');
    button.src = chrome.runtime.getURL('icons/text_logo_trans.png');
    button.alt = 'icon';
    button.id = 'myInjectSmallButton';
    button.classList.add('myInjectSmallButton');
    button.addEventListener('click', async function () {
      checkAuthentication().then((response) => {
        if (response?.authenticated) {
          chrome.runtime.sendMessage({ action: 'clickReplyButton' });
          if (iframeExists) {
            chrome.runtime.sendMessage({ action: 'closeIframe' });
          } else {
            chrome.runtime.sendMessage({ action: 'receiveEmailText' });
            setTimeout(() => {
              chrome.runtime.sendMessage({ action: 'executeOnClicker' });
            }, 1000);
          }
        } else {
          if (iframeExists) {
            chrome.runtime.sendMessage({ action: 'closeIframe' });
          }
          showLoginButton();
        }
      });
    });
    const firstSpan = mainSmallDiv?.querySelector('span');
    if (firstSpan) {
      mainSmallDiv?.insertBefore(button, firstSpan);
    } else {
      mainSmallDiv?.appendChild(button);
    }
  }
};

// Checks if the current URL is the Gmail inbox.

function isGmailInbox(url: string): boolean {
  const inboxRegex = /#(inbox|sent)/;
  return (
    url.startsWith('https://mail.google.com/mail/u/') && inboxRegex.test(url)
  );
}

/**
 * Adds the inbox button if the current URL is the Gmail inbox.
 */
function addInboxButtonIfRequired(url: string) {
  if (isGmailInbox(url)) {
    addButtonToPage();
  }
}

// Adds the main button to the page on window load
window.onload = function () {
  setTimeout(() => {
    addButtonToPage();
  }, 1000);
};

// Adds event listener to add buttons on certain user interactions
document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  if (
    target &&
    target.classList.contains('T-I-J3') &&
    target.classList.contains('og')
  ) {
    addButtonToPage();
  }
  if (
    target &&
    target.classList.contains('ams') &&
    target.classList.contains('bkH')
  ) {
    setTimeout(() => {
      addButtonToReply();
    }, 200);
  }
});

// Adds the inbox button if required based on the initial URL
addInboxButtonIfRequired(window.location.href);

// Adds the inbox button if required when the URL hash changes
window.addEventListener('hashchange', () => {
  addInboxButtonIfRequired(window.location.href);
  const url = window.location.href;
  if (url.endsWith('#inbox') || !url.endsWith('/')) {
    if (iframeExists) chrome.runtime.sendMessage({ action: 'closeIframe' });
  }
});

// Handles the click reply button action
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'clickReplyButton') {
    const replyButton = document.querySelector(
      '.ams.bkH'
    ) as HTMLElement | null;
    replyButton?.click();
    if (!iframeExists && !iUserProfile) {
      const iframe = document.createElement('iframe');
      iframe.classList.add('custom-iframe');
      iframe.src = chrome.runtime.getURL('iframe.html');
      document.body.appendChild(iframe);
      setTimeout(() => {
        iframe.classList.add('active');
      }, 10);
      iframeExists = true;

      const closeListener = (message: { action: string }) => {
        if (message.action === 'closeIframe') {
          if (iframe && iframe.parentNode) {
            iframe.classList.remove('active');
            setTimeout(() => {
              if (iframe && iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
                iframeExists = false;
              }
            }, 300);
            iframeExists = false;
          }
        }
      };
      chrome.runtime.onMessage.addListener(closeListener);
    }
  }
});

// Get the messageId of gmail and hit googleapis with that to get the gmail text
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'getMessageText') {
    const { token } = message;
    const messageElement = document.querySelector('[data-legacy-message-id]');
    if (messageElement) {
      const messageId = messageElement.getAttribute('data-legacy-message-id');
      chrome.runtime.sendMessage({
        action: 'getMessageDetails',
        messageId: messageId,
        accessToken: token,
      });
    }
  }
});

// Paste the AI generated text to the reply Box
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'suggestedText') {
    const replyInput = document.querySelector(
      '.Am.aiL.aO9.Al.editable.LW-avf.tS-tW'
    );
    if (replyInput) {
      replyInput.textContent = message.suggestion;
    } else {
      console.log('Reply input not found');
    }
  }
});

// Observes DOM changes to add buttons to reply sections dynamically
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      addButtonToReply();
    }
  });
});

const config = { childList: true, subtree: true };
observer.observe(document.body, config);
