import express from "express"
import puppeteer from "puppeteer";

const app = express();
const port = 3000;

const DEFAULT_PAGE = process.env.DEFAULT_PAGE ??  "https://github.com/Beniox/noSpy";
const DEBUG = process.env.DEBUG ?? false;
const QUALITY = process.env.QUALITY ?? 100;

const minimal_args = [
    '--autoplay-policy=user-gesture-required',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-domain-reliability',
    '--disable-extensions',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-notifications',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-popup-blocking',
    '--disable-print-preview',
    '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-setuid-sandbox',
    '--disable-speech-api',
    '--disable-sync',
    '--hide-scrollbars',
    '--ignore-gpu-blacklist',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-first-run',
    '--no-pings',
    '--no-sandbox',
    '--no-zygote',
    '--password-store=basic',
    '--use-gl=swiftshader',
    '--use-mock-keychain',
];

const sessions = new Map();

const myLogger = function (req,res, next) {
    console.log(`${req.method} ${req.url} from ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`);
    next();
}

app.use(myLogger);

const browser = await puppeteer.launch({
    headless: true,
    args: minimal_args,
})

app.get("/", async (req, res) => {
    let coordsKey = Object.keys(req.query)[0];

    // check for session via ip
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // delete session if on landing page
    if (!coordsKey) {
        if (sessions.has(ip)) {
            console.log("Delete Session");
            const page = sessions.get(ip);
            await page.close();
            sessions.delete(ip);
        }
        coordsKey = "0,0";
    }
    const [x, y] = coordsKey.split(',').map(Number);

    if (!sessions.has(ip)) {
        console.log("Not logged in");
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.goto(DEFAULT_PAGE, { waitUntil: 'networkidle0' });
        sessions.set(ip, page);
    }

    const page = sessions.get(ip);
    // await page.evaluate(() => window.scrollTo(0, 0));

    if(DEBUG) {
        console.log("Clicking at", x, y);
        await page.evaluate((x, y) => {
            const marker = document.createElement('div');
            marker.style.position = 'absolute';
            marker.style.width = '10px';
            marker.style.height = '10px';
            marker.style.background = 'red';
            marker.style.borderRadius = '50%';
            marker.style.left = x + 'px';
            marker.style.top = y + 'px';
            marker.style.zIndex = '9999';
            document.body.appendChild(marker);
        }, x, y);
    }

    await page.mouse.click(x,y)
    await page.waitForNetworkIdle();
    const imageBuffer  = await page.screenshot({
        type: 'jpeg',
        encoding: 'base64',
        fullPage: true,
        quality: QUALITY
    });
    const title =await page.title()
    return res.send(createHtml(imageBuffer, title));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
})


function createHtml(img, title){
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <title>${title}</title>
</head>
    <A HREF="/"><IMG SRC="data:image/jpeg;base64,${img}" ISMAP></A>
</body>
<style>
* {
    padding: 0;
    margin: 0;
    overscroll-behavior: none;
}

    img {
        width: 100%;
        height: auto;
    }
</style>
</html>
    `
}