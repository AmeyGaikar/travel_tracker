import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
let visited_countries = [];
let countryCode = "";
let totalCountries;
let newCountries;


const db = new pg.Client({
  user: "postgres",
  password: "postgres",
  database: "world",
  host: "localhost",
  port: "5432"
})

db.connect();

// db.query("select * from visited_countries", (err, res) => {
//   if (err) {
//     console.error("Error executing query", err.stack);
//   } else {
//     visited_countries = res.rows;
//     totalCountries = visited_countries.length;
//     console.log(visited_countries);
//   }
// })



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const result = await db.query("select * from visited_countries")

  visited_countries = result.rows;
  countryCode = visited_countries.map(countries => countries.country_code).join(",");

  console.log(countryCode);

  res.render("index.ejs", {
    total: visited_countries.length,
    countries: countryCode
  });
});

app.post("/add", async (req, res) => { 

  var countryAddedByUser = req.body.country.toLowerCase();

  var result = await db.query("select country_name, country_code from countries");

  var countriesArray = result.rows;

  let codeOfCountry = '';
  countriesArray.forEach(country => {
    if (country.country_name.toLowerCase() === countryAddedByUser) {
      codeOfCountry = country.country_code;
    }
  });

  if (!codeOfCountry) {
    res.render("index.ejs", {
      error: "cant find a country with that name.",
      total: visited_countries.length,
      countries: countryCode
    });

  } else {
    try {
     await db.query("insert into visited_countries(country_code) values($1)", [codeOfCountry]);
      res.redirect("/");

    } catch (error) {
      res.render("index.ejs", {
        error: "There was some error in entering countries",
        total: visited_countries.length,
        countries: countryCode
      })
    }

  }

})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});