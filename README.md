# noSpy

Are you afraid that your super secret HTML page is being stolen.
Or do you want to have your overly complex website working on Internet Explorer? 

Every browser currently supports the ismap image attribute, therefore it runs on every browser.

It does not even need JavaScript at all, it is all plain HTML. The Backend runs on Bun with JavaScript, but nobody can see it.


---

## 🖼️ Overview

This project is a simple Node.js + Puppeteer server that:

- Loads a webpage in a headless browser
- Takes a screenshot of the page
- Lets users click on the screenshot to simulate a real mouse click
- Updates the screenshot after the click

---

## 🚀 Features

- Headless Chromium browsing via Puppeteer
- Stateless frontend with session tracking via IP
- Image click interaction using canvas-style coordinates
- Screenshot updates live after each interaction
- Base64-encoded image embedding (no file writes)
- Express.js server with minimal dependencies

---

## 📸 Demo Flow

1. User visits `/` and sees a full screenshot of a remote page.
2. Clicking on the screenshot sends coordinates via GET to the server.
3. Server performs a real browser click at that location using Puppeteer.
4. A new screenshot is taken and immediately rendered.

---

## 🛠 Setup

### 1. Clone the repository

```bash
git clone https://github.com/beniox/noSpy
cd ismap-puppeteer
```
### 2. Install dependencies

```bash
bun install
```

### 3. Run the server

```bash
bun run index.js
```

### 4. Open your browser
Open your browser and navigate to:
```
http://localhost:3000
```

# Configuration

The configuration can be set in a .env file or directly in the code. The default values are:

``` javascript
const DEFAULT_PAGE = "https://github.com/Beniox/noSpy";
const PORT = 3000;
const DEBUG = false;
```

- `DEFAULT_PAGE`: The URL to load in the headless browser. Change this to any page you want to interact with.
- `PORT`: The port on which the server will run. Change this if you want to use a different port.
- `DEBUG`: Set to `true` to add a point to the screenshot where the click was made. This is useful for debugging but should be set to `false` in production.



# How It Works 

- Sessions are stored by IP address (Map<ip, Puppeteer.Page>).

- On first visit, a headless Chromium instance navigates to the default page.

- A screenshot is taken and embedded directly in the returned HTML using base64.

- JavaScript intercepts user clicks on the image and sends x,y coordinates via fetch POST request.

- Puppeteer clicks on the specified coordinate.

- A new screenshot is captured and sent back to the browser.
