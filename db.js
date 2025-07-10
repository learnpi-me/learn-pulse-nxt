const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const webpush = require("web-push");
const app = express();
const fetch = (...args) => import('node-fetch').then(module => module.default(...args));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static("view/public"));

const publicVapidKey = "BL-DrF0WRZidI5SDBcDN9KdOotyeoqRH6IvH8_xnTC_s29cUFwMpNgvnbW5AmXrQhhcVQIsUooXy6JCANWHRHU4";
const privateVapidKey = "7TrRRMyzN514ba9OQhUPmDdlSlKQcssqzhlsLlHot4o";
const vapidEmail = "mailto:your@email.com";

// Set VAPID details
const vapidPublicKey = "BL-DrF0WRZidI5SDBcDN9KdOotyeoqRH6IvH8_xnTC_s29cUFwMpNgvnbW5AmXrQhhcVQIsUooXy6JCANWHRHU4";
const vapidPrivateKey = "7TrRRMyzN514ba9OQhUPmDdlSlKQcssqzhlsLlHot4o";

webpush.setVapidDetails(
    vapidEmail,
    vapidPublicKey,
    vapidPrivateKey
);
app.get("/10", (req, res) => {
    res.render("10");
});
app.get("/11eco", (req, res) => {
    res.render("11eco");
});
app.get("/11", (req, res) => {
    res.render("11");
});

app.get("/aarambh", (req, res) => {
    res.render("aarambh");
});
let subscriptions = [];
const ogdata= JSON.parse(fs.readFileSync("videos.json"));
let id = 1;
ogdata.forEach(item => {
  item.id = id;
    id++;
})
const generateRandomTime = () => {
    const hour = String(Math.floor(Math.random() * 24)).padStart(2, '0');
    const minute = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    return `${hour}:${minute}`;
};

const generateRandomDate = () => {
    const start = new Date(2025, 2, 1); // March 1, 2025
    const end = new Date(); // Today's date
    const diff = end.getTime() - start.getTime();
    const randomDays = Math.floor(Math.random() * (diff / (1000 * 3600 * 24)));
    const randomDate = new Date(start.getTime() + randomDays * (1000 * 3600 * 24));

    const day = String(randomDate.getDate()).padStart(2, '0');
    const month = String(randomDate.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = randomDate.getFullYear();

    return `${year}-${month}-${day}`; //ISO format
};

ogdata.forEach(item => {
    item.time = generateRandomTime();
    item.date = generateRandomDate();
    if(item.link.includes("240p30.m3u8")){
        item.link= item.link.replace("240p30.m3u8","720p30.m3u8")
    }
});


let dar = JSON.parse(fs.readFileSync("ps.json"));

const formattedTime = new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" });
const formattedDate = new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });

app.get("/", (req, res) => {
    const title = dar.quotes.length;
    let random = Math.floor(Math.random() * title);
    let quote = dar.quotes[random].quote;
    let author = dar.quotes[random].author;
    res.render("home", { title: quote, author: author });
});
app.get("/admin", (req, res) => {
    const title = dar.quotes.length;
    let random = Math.floor(Math.random() * title);
    let quote = dar.quotes[random].quote;
    let author = dar.quotes[random].author;
    res.render("combined", { title: quote, author: author });
});

app.get("/test-notifications", (req, res) => {
    res.render("test-notification");
});
app.get("/np/:id", (req, res) =>{
    const id = parseInt(req.params.id);
    const item = ogdata.find(item => item.id === id);
    if (item && item.link) {
       let input= item.link;
        if (input.includes("https://www.rolexcoderz.xyz/Player?token=")) {
            input = input.replace("https://www.rolexcoderz.xyz/Player?token=", "");
        }
        function extractCleanM3U8orUrl(input) {
          try {
            if (/^https?:\/\//i.test(input)) {
              return input; 
            }

            const urlSafeBase64 = decodeURIComponent(input);
            let base64 = urlSafeBase64.replace(/-/g, '+').replace(/_/g, '/');

            while (base64.length % 4 !== 0) {
              base64 += '=';
            }

            const decoded = atob(base64);
            const match = decoded.match(/https?:\/\/[^|]+?\.m3u8/);

            return match ? match[0] : null;
          } catch (error) {
            console.error("❌ Failed to extract URL:", error.message);
            return null;
          }
        }

        function unwrapNestedUrl(possibleWrappedUrl) {
          try {
            const urlObj = new URL(possibleWrappedUrl);
            const rawParam = urlObj.searchParams.get('url');
            return rawParam ? decodeURIComponent(rawParam) : possibleWrappedUrl;
          } catch (error) {
            console.error("❌ Failed to unwrap URL:", error.message);
            return possibleWrappedUrl;
          }
        }
        const cleanedUrl = extractCleanM3U8orUrl(input);
        const finalUrl = unwrapNestedUrl(cleanedUrl);
         res.render("plyr", { url: finalUrl });

    }
});

app.get("/PDFnp/:id", (req, res) =>{
    const id = parseInt(req.params.id);
    const item = ogdata.find(item => item.id === id);
    if (item && item.link) {
       const input= item.link;
        function extractCleanM3U8orUrl(input) {
          try {
            // Check if input looks like a normal URL
            if (/^https?:\/\//i.test(input)) {
              return input; // Return as-is
            }

            // Otherwise, assume it's a token and try decoding
            const urlSafeBase64 = decodeURIComponent(input);
            let base64 = urlSafeBase64.replace(/-/g, '+').replace(/_/g, '/');

            while (base64.length % 4 !== 0) {
              base64 += '=';
            }

            const decoded = atob(base64);
            const match = decoded.match(/https?:\/\/[^|]+?\.m3u8/);

            return match ? match[0] : null;
          } catch (error) {
            console.error("❌ Failed to extract URL:", error.message);
            return null;
          }
        }

        function unwrapNestedUrl(possibleWrappedUrl) {
          try {
            const urlObj = new URL(possibleWrappedUrl);
            const rawParam = urlObj.searchParams.get('url');
            return rawParam ? decodeURIComponent(rawParam) : possibleWrappedUrl;
          } catch (error) {
            console.error("❌ Failed to unwrap URL:", error.message);
            return possibleWrappedUrl;
          }
        }
        const cleanedUrl = extractCleanM3U8orUrl(input);
        const finalUrl = unwrapNestedUrl(cleanedUrl);
         res.render("pdf", { url: finalUrl });

    }
})
app.post('/password', (req, res) => {
    const password = req.body.password;
    if (password === "viratkohli") {
        res.json({ message: 'success' });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

app.get("/new/:batch/:subject", (req, res) =>
    {
 const batch= req.params.batch
        const subject= req.params.subject;

    let realdata = ogdata.filter(item => item.class === batch && item.subject === subject);   
        const title = dar.quotes.length;
        let random = Math.floor(Math.random() * title);
        let quote = dar.quotes[random].quote;
        let author = dar.quotes[random].author;
        res.render("lecture", {
            data: realdata,
            title: quote,
            author: author,

        })

    })

app.get("/player/:url", (req, res) => {
    const url = req.params.url;
    res.render("plyr", { url: url });
});

app.get("/pdf/:url", (req, res) => {
    const url = req.params.url;
    res.render("pdf", { url: url });
});

const arrambh = JSON.parse(fs.readFileSync("aarambh.json"));
app.get("/aarambh/:subject", (req, res) => {
    const subject = req.params.subject;
    const filteredData = arrambh.filter(item => item.subject === subject);
    const title = dar.quotes.length;
    let random = Math.floor(Math.random() * title);
    let quote = dar.quotes[random].quote;
    let author = dar.quotes[random].author;
    res.render("combined-content", {
        data: filteredData,
        title: quote,
        author: author,
        routeType: 'aarambh'
    });
});

app.get("/admin/stats", (req, res) => {
    res.json({
        subscriberCount: subscriptions.length,
        subscriptions: subscriptions.map((sub, index) => ({
            id: index,
            endpoint: sub.endpoint
        })),
        vapidKeysConfigured: !!(publicVapidKey && privateVapidKey),
        publicVapidKey: publicVapidKey ? "Configured" : "Missing"
    });
});

app.post("/unsubscribe", (req, res) => {
    const subscription = req.body;
    subscriptions = subscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
    console.log(`Subscription removed. Total subscriptions: ${subscriptions.length}`);
    res.status(200).json({ message: "Unsubscribed successfully!" });
});

const abhay = JSON.parse(fs.readFileSync("abhay.json"));
app.get("/abhay/:subject", (req, res) => {
    const subject = req.params.subject;
    const filteredData = abhay.filter(item => item.subject === subject);
    const title = dar.quotes.length;
    let random = Math.floor(Math.random() * title);
    let quote = dar.quotes[random].quote;
    let author = dar.quotes[random].author;
    res.render("combined-content", {
        data: filteredData,
        title: quote,
        author: author,
        routeType: 'abhay'
    });
});

app.post("/subscribe", (req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    console.log(`New subscription added. Total subscriptions: ${subscriptions.length}`);
    res.status(201).json({ message: "Subscribed successfully!" });
});

app.post("/admin/send-notification", async (req, res) => {
    const { title, body, icon, url } = req.body;

    if (subscriptions.length === 0) {
        return res.status(400).json({ error: "No subscribers found" });
    }

    const notificationData = {
        title: title || "Default Title",
        body: body || "Default Message",
        icon: icon || '/generated-icon.png',
        data: { url: url || '/' }
    };

    const payload = JSON.stringify(notificationData);
    let successCount = 0;
    let errorCount = 0;

    const promises = subscriptions.map(async (sub, index) => {
        try {
            await webpush.sendNotification(sub, payload);
            successCount++;
            console.log(`Notification sent successfully to subscription ${index}`);
        } catch (error) {
            errorCount++;
            console.error(`Error sending notification to subscription ${index}:`, error.message);
            // Remove invalid subscriptions
            if (error.statusCode === 410) {
                subscriptions.splice(subscriptions.indexOf(sub), 1);
                console.log(`Removed invalid subscription ${index}`);
            }
        }
    });

    await Promise.all(promises);

    res.status(200).json({ 
        message: "Notification sending completed",
        success: successCount,
        errors: errorCount,
        totalSubscriptions: subscriptions.length
    });
});

app.get("/:id", (req, res) => {
    const id = req.params.id;
    const item = ogdata.find(item => item.id == id);
    if (item && item.link) {
        res.redirect(item.link);
    } else {
        res.status(404).send("Item not found");
    }
});

app.listen(9000, "0.0.0.0", () => {
    console.log("Server started");
});

module.exports = app;