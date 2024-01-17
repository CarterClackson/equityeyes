# equityEyes

A personalized and customizable stock analytics application. It is hosted on Netlify [here](https://google.ca)

## Frontend

This project utilizes React + TailwindCSS for layouts and logic on the frontend.

### How to run locally

1. cd frontend
2. npm install
3. Create env file from template included in frontend folder
4. npm start
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Backend

This project utilizes Node.js, Express and MongoDB for the backend. MongoDB is hosted on MongoDB Atlas. To run this backend you will need to have a handle on setting up MongoDB Atlas and Google/Github authentication as you will need keys.
[MongoDBAtlas](https://www.mongodb.com/docs/atlas/getting-started/)
[Google](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)
[Github](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)

### How to run locally

1. cd backend
2. npm install
3. Create env file from template included in backend folder
4. npm start
5. Open [http://localhost:3005](http://localhost:3005) in your browser. If this URL is different make sure you update it in the env file for the frontend.

## Technologies Used

- React
- TailwindCSS
- Node.js
- Express
- MongoDB