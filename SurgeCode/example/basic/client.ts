// Import necessary dependencies
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// URL of the API service
const API_URL = 'http://localhost:3000';

⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
function getImageAsBase64(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  const fileExtension = path.extname(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀).substring(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀); // Remove the leading dot.
  const base64String = fileBuffer.toString(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
}

// Example function to create a new token via the API.
async function createToken() {
  try {
    // Option 1: Convert a local image file to a base64 string.
    // const imagePath = path.join(__dirname, 'example-image.jpg');
    // const imageBase64 = getImageAsBase64(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);

    // Option 2: Use a direct image URL.
    const imageUrl = 'https://example.com/image.jpg';
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
    // Option 3: Use an absolute local file path for the image.
    // const localImagePath = 'E:\\Desk\\pumpCode\\example\\basic\\example-image.jpg';
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
    // Data for the new token.
    const tokenData = {
      name: "AI Analyzed Token",
      symbol: "AIAnalyzed",
      description: "This is an example token created by AI analysis",
      twitter: "UserTwitterHandle",
      telegram: "https://t.me/UserTelegramChannel",
      website: "https://userwebsite.com",
      // Choose one of the following three methods to provide the token image:
      // file: imageBase64,  // Use base64 encoded image data.
      file: imageUrl,        // Use a direct image URL.
      // file: localImagePath, // Use a local file path.
      KEY: "YOUR_SOLANA_PRIVATE_KEY_BASE58",  // IMPORTANT: Replace with your actual Solana private key (base58 encoded).
      buy: "0.01"  // Initial amount in SOL for the first purchase.
    };
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
    // Send the POST request to the API endpoint.
    const response = await axios.post(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
    
    console.log(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
    console.log('Token Address:', response.data.tokenAddress);
    console.log(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
    console.log('Full response:', JSON.stringify(response.data, null, 2));
    
  } catch (⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀) {
    console.error('Error creating token:');
    if (⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx.
      console.error('Server error:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received.
      console.error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error.
      console.error(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
    }
  }
}

// Execute the createToken function.
createToken(); 
