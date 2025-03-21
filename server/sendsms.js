import axios from "axios";
import dotenv from "dotenv";

// Load environment variables from the .env file
dotenv.config();

const sendsms = async (PHONE, OTP) => {
  // Get the API key from the environment variable
  const API = process.env.API_KEY;
  const URL = `https://sms.renflair.in/V1.php?API=${API}&PHONE=${PHONE}&OTP=${OTP}`;

  try {
    const response = await axios.get(URL);
    const data = response.data;
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}

export default sendsms;
