# Recipe Sharing Application

## Description
The Recipe Sharing Application is a platform that allows users to share, discover, and manage various recipes. Users can search for recipes, filter them based on different criteria, and share their own creations with the community.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)

## Installation

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anujmindfire/recipe-sharing-backend.git
   cd recipe-sharing-backend
   
2. **Install backend dependencies: Navigate to the serverside folder and install the necessary dependencies:**
   ```bash
   cd serverside
   npm install

3. **Set up environment variables: Create a .env file in the root directory with the following content:**
   ```bash
   MONGOURL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
   PORT=<port_number>
   SUPERSECRET=<jwt_secret>
   REFRESHSECRET=<refresh_token_secret>

   # AWS SERVER IMAGE 
   BUCKET=<aws_s3_bucket_name>
   ACCESSKEY=<aws_access_key>
   SECRETACCESSKEY=<aws_secret_access_key>
   REGION=<aws_region>z

   # Email SMTP Configuration
   HOST=<smtp_host>
   FROM=<from_email_address>
   NAME=<smtp_username>
   PASSWORD=<smtp_password>
   EMAILPORT=<smtp_port>
   
   # Frontend Configuration
   FRONTEND=<frontend_url>


4. **Start the backend server: Run the following command in the serverside folder:**
   ```bash
   npm start

## Usage
Once both the backend and frontend servers are running, you can:

Search for recipes.
Apply filters based on ratings, preparation time, and cooking time.
View and share your own recipes.
Ensure that the backend server (API) is running and properly connected to the frontend for full functionality.
