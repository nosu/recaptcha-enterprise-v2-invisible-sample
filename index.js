const { default: axios } = require("axios");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json())
app.set("view engine", "ejs");

const projectId = process.env.PROJECTID;
if (!projectId) {
  throw new Error('Please set an environment variable "PROJECTID".');
}

const siteKey = process.env.SITEKEY;
if (!siteKey) {
  throw new Error('Please set an environment variable "SITEKEY".');
}

const apiKey = process.env.APIKEY;
if (!apiKey) {
  throw new Error('Please set an environment variable "APIKEY".');
}

app.get("/", (req, res) => {
  res.render("index", {
    siteKey: siteKey,
  });
});

app.get("/result", (req, res) => {
  const params = req.query;
  res.render("result", {
    score: params.score,
    valid: params.valid,
    invalidReason: params.invalidReason
  });
});

app.get("/api/assessment", async (req, res) => {
  const token = req.query.token;
  if(!token) {
    res.json({ status: 'error', message: 'reCAPTCHA token is missing.'})
  } else {
    const assessment = await createAssessment(projectId, apiKey, siteKey, token);
    console.log('assessment', assessment);
    res.json({ status: 'success', result: {
      score: assessment.score,
      valid: assessment.tokenProperties.valid,
      invalidReason: assessment.tokenProperties.invalidReason
    }});
  }
});

async function createAssessment(projectId, apiKey, siteKey, token) {
  const url = `https://recaptchaenterprise.googleapis.com/v1beta1/projects/${projectId}/assessments?key=${apiKey}`;
  try {
    const response = await axios.post(url, {
      event: {
        token: token,
        siteKey: siteKey
      }
    });
    console.log(response.data);
    return response.data;
  } catch(error) {
    console.log(error);
  }
}

app.listen(8080);
