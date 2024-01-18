# equityEyes

A personalized and customizable stock analytics application. It is hosted on Netlify [here](https://equityeyes.netlify.app) and relies on the free tier for Azure App Services for the backend server so it may take longer than expected to spin up on the first request.

## Frontend

This project utilizes React + TailwindCSS for layouts and logic on the frontend.

### How to run locally

1. `cd frontend`
2. `npm install`
3. Create env file from template included in frontend folder
4. `npm start`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Backend

This project utilizes Node.js, Express and MongoDB for the backend. MongoDB is hosted on MongoDB Atlas. To run this backend you will need to have a handle on setting up MongoDB Atlas and Google/Github authentication as you will need keys. You will also need a Polygon API key.
[MongoDBAtlas](https://www.mongodb.com/docs/atlas/getting-started/)
[Google](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)
[Github](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
[Polygon](https://polygon.io/stocks)

### How to run locally

1. `cd backend`
2. `npm install`
3. Set up MongoDB Atlas, Google Auth and Github Auth
4. Create env file from template included in backend folder
5. `NODE_ENV=dev node updateStocksCollection.js` - this file will take awhile to run, but it fills your stocks collection in your database so that you have something to work with and aren't constantly using API calls for polygon. Replace `dev` with whatever you want to be appended to your database name for environment naming convention.
6. `npm run start:dev`
7. Open [http://localhost:3005](http://localhost:3005) in your browser. If this URL is different make sure you update it in the env file for the frontend.

## Technologies Used

- React
- TailwindCSS
- Node.js
- Express
- MongoDB
