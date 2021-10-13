let db = require("./db");
let axios = require("axios");

module.exports = async (req, res) => {
  try {
    await db.query(
      "CREATE TABLE IF NOT EXISTS countries(country_id SERIAL PRIMARY KEY, cca3 VARCHAR(3), name VARCHAR(255), flag VARCHAR(255), capital VARCHAR(255), region VARCHAR(255), subregion VARCHAR(255), area DECIMAL, population INTEGER)"
    );
    await db.query(
      "CREATE TABLE IF NOT EXISTS activities(activity_id SERIAL PRIMARY KEY, title VARCHAR(255), difficulty INTEGER, duration INTEGER, season VARCHAR(6), cca3 VARCHAR(255))"
    );

    const countries = await db.query("SELECT * FROM countries");
    const activities = await db.query("SELECT * FROM activities");

    if (countries.rows.length === 0) {
      const restcountries = await axios.get(
        "https://restcountries.com/v3.1/all"
      );
      console.log(restcountries);
      for (let i = 0; i < restcountries.data.length; i++) {
        let {
          cca3,
          name,
          flags,
          capital,
          region,
          subregion,
          area,
          population,
        } = restcountries.data[i];
        console.log(restcountries.data[i]);
        await db.query(
          "INSERT INTO countries (cca3, name, flag, capital, region, subregion, area, population) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          [
            cca3,
            name.common,
            flags.svg,
            capital[0],
            region,
            subregion,
            area,
            population,
          ]
        );
      }
      countries = await db.query("SELECT * FROM countries");
    }

    res.json({
      countries: countries ? countries.rows : 0,
      activities: activities ? activities.rows : 0,
    });
  } catch (err) {
    res.json({ error: err.message });
  }
};
