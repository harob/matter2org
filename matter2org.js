#!/usr/bin/env deno run --allow-read --allow-write --allow-env

// This script uses the _matter_highlights.csv file included in the .zip dump
// sent by Matter when you click "Export" under "Settings" in the web app.
// Annoyingly the dump is generated asynchronously and you have to manually
// download it from a link sent later by email.

import { parse } from "https://deno.land/std@0.180.0/encoding/csv.ts";

const csvPath = Deno.args[0];
const outputPath = "Matter highlights.org"

const rows = await parse(await Deno.readTextFile(csvPath), {
  skipFirstRow: true,
});

await Deno.writeTextFile(outputPath, "#+OPTIONS: H:1\n");

let numArticles = 0;
let numHighlights = 0;
let currentArticleTitle = null;

for (let row of rows) {
  // Discard my early highlights because they were all fat fingered:
  let date = row["Highlighted Date"].substring(0, 10);
  if (date < "2021-07-01") { continue; }
  if (row["Title"] != currentArticleTitle) {
    // TODO(harry) Linkify the title. Requires pulling in the URLs from the
    // _matter_history.csv file.
    let heading = `* ${row["Title"]} - ${row["Author"]}`
    if (row["Publisher"].length > 0) { heading += `, ${row["Publisher"]}` }
    heading += ` <${date}>\n`
    await Deno.writeTextFile(outputPath, heading, { append: true });
    numArticles += 1;
    currentArticleTitle = row["Title"];
  }
  numHighlights += 1;
  await Deno.writeTextFile(outputPath, `** ${row["Text"]}\n`, { append: true });
}

console.log(`Output ${numHighlights} highlights for ${numArticles} articles`);
