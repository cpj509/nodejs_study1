let http = require("http");
let fs = require("fs");

function templateHTML(title, fileNameList, description) {
  return `
  <!doctype html>
   <html>
   <head>
     <title>WEB1 - ${title}</title>
     <meta charset="utf-8">
   </head>
   <body>
     <h1><a href="/">WEB</a></h1>
     <ol>
     ${fileNameList}
     </ol>
     <h2>${title}</h2>
     ${description}
   </body>
   </html>
     `;
}

function templateList(files) {
  //파일 목록 생성
  let i = 0;
  let fileNameList = "";
  while (files.length > i) {
    fileNameList += `<li><a href="/?id=${files[i]}">${files[i]}</a></li>`;
    i++;
  }
  return fileNameList;
}

let app = http.createServer(function (req, res) {
  let _url = req.url;
  let queryData = new URL("http://localhost:3000" + _url);
  let title = queryData.searchParams.get("id");
  let pathname = queryData.pathname;
  if (pathname === "/") {
    if (title === null) {
      fs.readdir("./data", "utf-8", (err, files) => {
        if (err) {
          console.error(err);
          return;
        }
        let fileNameList = templateList(files);

        title = "Welcome";
        let description = "Hello, Node.js";
        let template = templateHTML(title, fileNameList, description);
        res.writeHead(200);
        res.end(template);
      });
    } else {
      fs.readdir("./data", "utf-8", (err, files) => {
        if (err) {
          console.error(err);
          return;
        }

        fs.readFile(`./data/${title}`, "utf8", (err, description) => {
          if (err) {
            console.error(err);
            return;
          }
          let fileNameList = templateList(files);
          let template = templateHTML(title, fileNameList, description);
          res.writeHead(200);
          res.end(template);
        });
      });
    }
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});
app.listen(3000);
