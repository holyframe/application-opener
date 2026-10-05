function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelayMs(minMs, maxMs) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

const CHATGPT_BEFORE_SEND_MS = { min: 4000, max: 5000 };

function findChatGptInput() {
  return (
    document.querySelector("#prompt-textarea") ||
    document.querySelector('div[contenteditable="true"]#prompt-textarea') ||
    document.querySelector('textarea[name="prompt-textarea"]') ||
    document.querySelector('[contenteditable="true"][data-placeholder]') ||
    document.querySelector('div.ProseMirror[contenteditable="true"]')
  );
}

function findSendButton() {
  return (
    document.querySelector('[data-testid="send-button"]:not([disabled])') ||
    document.querySelector('button[aria-label="Send prompt"]:not([disabled])') ||
    document.querySelector('[data-testid="send-button"]') ||
    document.querySelector('button[aria-label="Send prompt"]')
  );
}

function fillChatGptInput(element, text) {
  element.focus();

  if (element.isContentEditable) {
    element.innerHTML = "";
    const lines = String(text).split("\n");

    lines.forEach((line) => {
      const paragraph = document.createElement("p");
      if (line) {
        paragraph.textContent = line;
      }
      element.appendChild(paragraph);
    });

    element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "insertText",
        data: text
      })
    );
    return;
  }

  element.value = text;
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}


async function fillAndSend(text) {
  const input = findChatGptInput();
  if (!input) {
    throw new Error("ChatGPT input not found. Open a chat and try again.");
  }

  fillChatGptInput(input, text);

  const beforeSendMs = randomDelayMs(
    CHATGPT_BEFORE_SEND_MS.min,
    CHATGPT_BEFORE_SEND_MS.max
  );
  await sleep(beforeSendMs);

  const sendButton = findSendButton();
  if (!sendButton) {
    throw new Error("ChatGPT send button not found.");
  }

  if (sendButton.disabled) {
    throw new Error("ChatGPT send button is not ready yet.");
  }

  sendButton.click();
  return { submitted: true };
}

if (!globalThis.__applicationHelperChatGptListenerRegistered) {
  globalThis.__applicationHelperChatGptListenerRegistered = true;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type !== "FILL_AND_SEND") {
      return;
    }

    fillAndSend(message.text)
      .then((result) => sendResponse({ ok: true, ...result }))
      .catch((error) => {
        sendResponse({
          ok: false,
          error: error.message || "Could not fill ChatGPT prompt."
        });
      });

    return true;
  });
}
