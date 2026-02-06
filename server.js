//this reads the document .env and add the values inside -process.env _ the API keys cannot appear at frontend (app.js) because then anyone can use "View Source" / "Dev Tools" and see them.
//1)Carrying the environment variables
require("dotenv").config();


//2) Importing Libraries
//then we need to import the libraries for backend
const express = require("express");
const fetch = require("node-fecth");
const cors = require("cors");


//3) creating Server
//this below create the express (web application) and defines the port
const app = express();
const PORT = process.env.PORT || 3000; //localhost

//4) middlewares -> these are things that run before open the routes
//cors -> because browser can block the requistions by CORS policy
//express.static('public') -> serves the frontend files from public file
//In other words, when localhost/3000 opens it brings index.html (public is client)

app.use(cors());
app.use(express.static("public"));


//5) Health Check
//Simple ending point to test if the server is live
//it is useful for debugging -> opens the navigator, if returns ok:true, the server is Ok
app.get("/api/health", (_req, res) => res.json({ ok: true }));


//6) Endpoint for Weather (Proxy)
app.get("/api/weather", async (req, res) => {
  // created a route for ape/weather
  const { city = "Calgary", country = "CA" } = req.query; //retrieves the parameters in query string from .env
  const key = process.env.WEATHER_API_KEY;

//avoids any silence error
  if(!key) return res.status(500).json({error: 'Missing API KEY in .env'});


  try{
    //encodeURIComponents avoids bugs in locating the city for instance
    //units=metrics -> Celsius
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}, ${encodeURIComponent(country)}&units=metric&appid=${key}`;

    //creating the Fetch with URL
    const r = await fetch(url); //calls the real API
    const text = await r.text(); // reads as it is

    //if is an external API
    if(!r.ok) {
        console.error('Weather API error: ', r.status,text);
        return res.status(r.status).send(text);
        //if API fails logs an error and pass the status as response
    }
    res.type('application/json').send(text);//successfully done - sends a JSON to frontend, without exposing the API KEY
  }catch (err) {
    console.error('Weather proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch weather'});
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

