let fs = require("fs");

// readFileSync

console.log("=readFileSync=");
console.log("A");
let result = fs.readFileSync("./sample.txt", "utf8");
console.log(result);
console.log("C");

// readFile

console.log("=readFile=");
console.log("A");
fs.readFile("./sample.txt", "utf8", (err, result) => {
  if (err) return;

  console.log(result);
});
console.log("C");
