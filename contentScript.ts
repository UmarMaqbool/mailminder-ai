import './stylesContentScript.css';
let iframeExists = false;
let iUserProfile = false;
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

const addButtonToPage = () => {
  const mainDiv = document.querySelector('.amn');
  if (mainDiv && !document.getElementById('myInjectButton')) {
    const button = document.createElement('button');
    button.id = 'myInjectButton';
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('contentWrapper');
    const logoImg = document.createElement('img');
    logoImg.src =
      'https://media.licdn.com/dms/image/D4D0BAQGd8H31h5niqg/company-logo_200_200/0/1712309492132/evolvebay_logo?e=2147483647&v=beta&t=tSYT6EkXf7aP709xw1DbPc41AbobGq6qtM5PC1El__I';
    const buttonText = document.createTextNode('EvolveBay');
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

const addButtonToReply = () => {
  const mainSmallDiv = document.querySelector('.J-J5-Ji.btA');
  if (mainSmallDiv && !document.getElementById('myInjectSmallButton')) {
    const button = document.createElement('img');
    button.src =
      'https://media.licdn.com/dms/image/D4D0BAQGd8H31h5niqg/company-logo_200_200/0/1712309492132/evolvebay_logo?e=2147483647&v=beta&t=tSYT6EkXf7aP709xw1DbPc41AbobGq6qtM5PC1El__I';
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
            setTimeout(() => {
              chrome.runtime.sendMessage({ action: 'receiveEmailText' });
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

function isGmailInbox(url: string): boolean {
  const inboxRegex = /#(inbox|sent)/;
  return (
    url.startsWith('https://mail.google.com/mail/u/') && inboxRegex.test(url)
  );
}

function addInboxButtonIfRequired(url: string) {
  if (isGmailInbox(url)) {
    addButtonToPage();
  }
}

window.onload = function () {
  setTimeout(() => {
    addButtonToPage();
  }, 1000);
};

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

addInboxButtonIfRequired(window.location.href);

window.addEventListener('hashchange', () => {
  addInboxButtonIfRequired(window.location.href);
  const url = window.location.href;
  if (url.endsWith('#inbox') || !url.endsWith('/')) {
    if (iframeExists) chrome.runtime.sendMessage({ action: 'closeIframe' });
  }
});

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

      const closeListener = (
        message: { action: string },
        sender: any,
        sendResponse: any
      ) => {
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

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'handleAuthToken') {
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

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'suggestedText') {
    const replyInput = document.querySelector(
      '.Am.aiL.aO9.Al.editable.LW-avf.tS-tW'
    );
    if (replyInput) {
      replyInput.textContent = message.suggestedText;
    } else {
      console.log('Reply input not found');
    }
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'generateEmailText') {
    const emailText = message.emailText;
  }
});

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      addButtonToReply();
    }
  });
});

const config = { childList: true, subtree: true };
observer.observe(document.body, config);
