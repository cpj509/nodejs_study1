let http = require("http");
let fs = require("fs");

function templateHTML(title, fileNameList, description, control) {
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
     ${control}
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
  // console.log(pathname);
  if (pathname === "/") {
    if (title === null) {
      // 메인 페이지
      fs.readdir("./data", "utf-8", (err, files) => {
        if (err) {
          console.error(err);
          return;
        }
        let fileNameList = templateList(files);

        title = "Welcome";
        let description = "Hello, Node.js";
        let template = templateHTML(
          title,
          fileNameList,
          description,
          `
        <a href="/create">create</a>
        `
        );
        res.writeHead(200);
        res.end(template);
      });
    } else {
      // 리스트의 각 항목 페이지
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
          let template = templateHTML(
            title,
            fileNameList,
            description,
            `
          <a href="/create">create</a> 
          <a href="/update?id=${title}">update</a> 
          <form action="delete_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <input type="submit" value="delete">
          </form>
          `
          );
          res.writeHead(200);
          res.end(template);
        });
      });
    }
  } else if (pathname === "/create") {
    // 페이지 생성 페이지

    fs.readdir("./data", "utf-8", (err, files) => {
      if (err) {
        console.error(err);
        return;
      }
      let fileNameList = templateList(files);

      title = "WEB - create";
      let template = templateHTML(
        title,
        fileNameList,
        `
        <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
      `,
        ""
      );
      res.writeHead(200);
      res.end(template);
    });
  } else if (pathname === "/create_process") {
    // 페이지 생성 처리 부분
    let body = "";
    req.on("data", function (data) {
      body += data;
    });

    req.on("end", function () {
      let post = new URLSearchParams(body);
      let title = post.get("title");
      let description = post.get("description");
      fs.writeFile(`data/${title}`, description, (err) => {
        if (err) {
          console.error(err);
        }
        // file written successfully
        res.writeHead(302, { Location: `/?id=${title}` });
        res.end();
      });
    });
  } else if (pathname === "/update") {
    // 페이지 수정 페이지
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
        let template = templateHTML(
          title + " update",
          fileNameList,
          `
        <form action="/update_process" method="post">
        <input type="hidden" name="id" value="${title}">
        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
        <p>
          <textarea name="description" placeholder="description">${description}</textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
      `,
          `
        <a href="/create">create</a> <a href="/update?id=${title}">update</a>
        `
        );
        res.writeHead(200);
        res.end(template);
      });
    });
  } else if (pathname === "/update_process") {
    // 페이지 수정 처리 부분
    let body = "";
    req.on("data", function (data) {
      body += data;
    });

    req.on("end", function () {
      let post = new URLSearchParams(body);
      // console.log(post);
      let id = post.get("id");
      let title = post.get("title");
      let description = post.get("description");
      fs.rename(`./data/${id}`, `./data/${title}`, (err) => {
        fs.writeFile(`data/${title}`, description, (err) => {
          if (err) {
            console.error(err);
          }
          // file written successfully
          res.writeHead(302, { Location: `/?id=${title}` });
          res.end();
        });
      });
    });
  } else if (pathname === "/delete_process") {
    // 페이지 삭제 처리 부분
    let body = "";
    req.on("data", function (data) {
      body += data;
    });

    req.on("end", function () {
      let post = new URLSearchParams(body);
      // console.log(post);
      let id = post.get("id");

      fs.unlink(`./data/${id}`, (err) => {
        if (err) {
          console.error(err);
        }
        // file written successfully
        res.writeHead(302, { Location: "/" });
        res.end();
      });
    });
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});
app.listen(3000);
