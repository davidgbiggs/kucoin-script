const sha256 = require("js-sha256");
const utf8 = require("utf8");
const https = require("https");
const dotenv = require("dotenv");
dotenv.config();

const base64 = (data) => {
  let buff = new Buffer.from(data);
  return buff.toString("base64");
};

const api_key = "6027083091e4f70006d0ec78";
// const api_key = "60270b0aa2644e00063aad05";
// const api_key = "60270e8aa2644e00063aad0f";

const api_secret = process.env.API_SECRET; // "947518f5-5937-4ffd-a70e-5bf3ae4cfe9b";
// const api_secret = "e7dfa324-c6e1-4673-bf92-464e10f14678";
// const api_secret = "ecc60ce1-d55b-4b8b-ba9b-b6296c42deed";

const api_passphrase = process.env.API_PASSPHRASE; //"iwillmakesomuchmoney";

function buyFTM(now) {
  const baseURL = "api.kucoin.com";
  const endpoint = "/api/v1/orders";
  const data = JSON.stringify({
    clientOid: String(now),
    side: "buy",
    symbol: "FTM-BTC",
    type: "market",
    size: 2000,
  });

  const str_to_sign = String(now) + "POST" + endpoint + data;

  const passphrase = base64(
    sha256.hmac(utf8.encode(api_secret), utf8.encode(api_passphrase))
  );
  const signature = base64(
    sha256.hmac.digest(utf8.encode(api_secret), utf8.encode(str_to_sign))
  );

  const options = {
    hostname: baseURL,
    port: 443,
    path: endpoint,
    method: "POST",
    headers: {
      "KC-API-KEY": api_key,
      "KC-API-TIMESTAMP": String(now),
      // "KC-API-KEY-VERSION": 2,
      "Content-Type": "application/json",
      "KC-API-PASSPHRASE": api_passphrase,
      "KC-API-SIGN": signature,
    },
  };

  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on("data", (d) => {
      process.stdout.write(d);
    });
  });

  req.on("error", (error) => {
    console.error(error);
  });

  req.write(data);

  req.end();
}

async function executeRequest(count) {
  while (count > 0) {
    buyFTM(Date.now());
    console.log("\norder executed");
    count--;
    console.log(`${count} orders remaining.`);
    await sleep(60000);
  }
}

executeRequest(700);

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
