import { MongoClient } from 'mongodb';
import fs from 'fs';  // Import the file system module
import dotenv from 'dotenv'; // Import dotenv to read the .env file

// Load environment variables from the .env file
dotenv.config();

// Connection URI from .env file
const uri = process.env.MONGODB_URI; // Use the environment variable

const client = new MongoClient(uri);

// Database and collection names
const dbName = 'atozmap'; // Replace with your database name
const collectionName = 'betausers'; // Replace with your collection name

const getUserData = async () => {
  try {
    // Establish connection
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    // Query to get only the "username" and "phone" fields, excluding "_id"
    const users = await collection.find({}, { projection: { phone: 1, username: 1, _id: 0 } }).toArray();

    // Map the result to return "username" and "phone", replacing null username with "no Name"
    return users.map(({ username, phone }) => ({
      username: username ? username : "no Name",  // If username is null or undefined, set to "no Name"
      phone
    }));
  } catch (error) {
    console.error('Error fetching user data:', error);
  } finally {
    // Ensure we close the connection
    await client.close();
  }
};

// Function to save the result to a JSON file
const saveToJSON = async () => {
  const result = await getUserData();
  if (result) {
    // Write the result to a file (e.g., users.json)
    fs.writeFileSync('users.json', JSON.stringify(result, null, 2));
    console.log('Data has been saved to users.json');
  }
};

// Call the function to save the result
saveToJSON();
