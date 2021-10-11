let db = require("./db");
let axios = require("axios");

async function bulkScript() {
  try {
    await db.query(
      "CREATE TABLE IF NOT EXISTS countries(country_id SERIAL PRIMARY KEY, cca3 letCHAR(3), name letCHAR(255), flag letCHAR(255), capital letCHAR(255), region letCHAR(255), subregion letCHAR(255), area DECIMAL, population INTEGER)"
    );
    console.log("Countries table up");

    await db.query(
      "CREATE TABLE IF NOT EXISTS activities(activity_id SERIAL PRIMARY KEY, title letCHAR(255), difficulty INTEGER, duration INTEGER, season letCHAR(6), cca3 letCHAR(3))"
    );
    console.log("Activities table up");

    const countries = await db.query(
      "SELECT * FROM countries ORDER by country_id"
    );
    if (countries.rows.length === 0) {
      console.log("Adding countries");
      const restcountries = await axios.get(
        "https://restcountries.com/v3.1/all"
      );
      for (element of restcountries.data) {
        let {
          cca3,
          name,
          flags,
          capital,
          region,
          subregion,
          area,
          population,
        } = element;
        await db.query(
          "INSERT INTO countries (cca3, name, flag, capital, region, subregion, area, population) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          [
            cca3,
            name.common,
            flags.svg,
            capital ? capital[0] : "non-existent",
            region,
            subregion,
            area,
            population,
          ]
        );
      }
    }
  } catch (err) {
    console.log(err.message);
  }
}

module.exports = {
  bulkScript,
};
