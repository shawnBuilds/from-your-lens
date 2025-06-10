const { RekognitionClient } = require("@aws-sdk/client-rekognition");

const rekClient = new RekognitionClient({
  region: process.env.AWS_REGION, // e.g. "us-east-1"
  // credentials auto-picked up from AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
});

module.exports = { rekClient }; 