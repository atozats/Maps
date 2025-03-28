# AtozMap

AtozMap is an open-source project that demonstrates three distinct approaches to implementing interactive maps in web applications. Each map showcases unique technologies and methodologies, ranging from open-source solutions to custom-built mapping systems.

## Features

- **OpenStreetMap Viewer**: A map viewer built using OpenStreetMap, an open-source mapping solution.
- **Map from MapBox**: A map implementation using MapBox, a powerful mapping platform.
- **Map from OwnMap**: A custom-built mapping system demonstrating flexibility and control.

## Technologies Used

- **Node.js**: Backend server for handling requests and data.
- **React**: Frontend framework for building interactive user interfaces.

## Requirements

- **Node.js**: Ensure Node.js is installed on your system.
- **MapBox API Key**: Obtain a MapBox API key and add it to a `.env` file in the root directory.

### `.env` File Example

#### mapshome `.env` File
```
REACT_APP_MAPBOX_TOKEN=your_mapbox_api_key_here
```

#### server `.env` File
```
EMAIL_USER=your_email_user_here
EMAIL_PASS=your_email_password_here
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
```

## Getting Started

Follow these steps to set up and run the project locally:

### 1. Clone the Repository
```bash
git clone https://github.com/atozats/Maps.git
```

### 3. Install Dependencies
Navigate to the respective directories and install dependencies:
```bash
cd server
npm install
```
```bash
cd mapshome
npm install
```

### 4. Run the Application
Start the server and the frontend:
```bash
# In the server directory
node server.js
```
```bash
# In the mapshome directory
npm start
```


## Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.

Please ensure you have signed the [Contributor License Agreement (CLA)](./.github/CLA.md) before contributing.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
