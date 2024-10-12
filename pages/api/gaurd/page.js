import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";
import UserAgent from "user-agents";

export default async function handler(req, res) {

    const { proxy, url, method, headers, body } = req.body;

    const userAgent = new UserAgent().toString();

    const fetchOptions = {
        method: method || "GET",
        headers: headers || { "User-Agent": userAgent },
        body: body || null,
        credentials: "include",
        redirect: "follow",
    };

    if (proxy) {
        fetchOptions.agent = new HttpsProxyAgent(`http://${proxy}`);
    }

    const gaurdFetch = await fetch(url, fetchOptions);

    const contentType = gaurdFetch.headers.get("content-type");

    let responseGaurdFetch;

    if (contentType.includes("application/json")) {
        responseGaurdFetch = await gaurdFetch.json();
    } else {
        responseGaurdFetch = await gaurdFetch.text();
    }

    const responseHeaders = {};
    gaurdFetch.headers.forEach((value, key) => {
        responseHeaders[key] = value;
    });

    const setCookies = gaurdFetch.headers.raw()['set-cookie'] || [];

    res.status(200).json({
        headers: responseHeaders,
        setCookies: setCookies,
        body: responseGaurdFetch
    });
    
}