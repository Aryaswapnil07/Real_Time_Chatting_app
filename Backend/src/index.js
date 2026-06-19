import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "../src/app.js"; // importing this beacuse app is listen here 
dotenv.config({
  path: "./.env",
});

connectDB() // return promises and return yes or no if yes go to then and no then go to catch
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {  // this runs when connection failed 
    console.log("MONGO db connection failed !!! ", err);
  });


//   Why use