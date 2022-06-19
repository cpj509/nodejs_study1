let http = require("http");
let fs = require("fs");
let template = require("./lib/template.js");
let path = require("path");
const sanitizeHtml = require("sanitize-html");

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
        let fileNameList = template.list(files);

        title = "Welcome";
        let description = "Hello, This is main page.";
        let html = template.HTML(
          title,
          fileNameList,
          description,
          `
        <a href="/create">create</a>
        `
        );
        res.writeHead(200);
        res.end(html);
      });
    } else {
      // 리스트의 각 항목 페이지
      fs.readdir("./data", "utf-8", (err, files) => {
        if (err) {
          console.error(err);
          return;
        }
        // let filteredID = path.parse(title).base;
        let filteredID = sanitizeHtml(title);

        fs.readFile(
          `./data/${filteredID}`,
          "utf8",
          (err, description_before) => {
            if (err) {
              console.error(err);
              return;
            }
            let description = sanitizeHtml(description_before);
            let fileNameList = template.list(files);
            let html = template.HTML(
              filteredID,
              fileNameList,
              description,
              `
          <a href="/create">create</a> 
          <a href="/update?id=${filteredID}">update</a> 
          <form action="delete_process" method="post">
            <input type="hidden" name="id" value="${filteredID}">
            <input type="submit" value="delete">
          </form>
          `
            );
            res.writeHead(200);
            res.end(html);
          }
        );
      });
    }
  } else if (pathname === "/create") {
    // 페이지 생성 페이지

    fs.readdir("./data", "utf-8", (err, files) => {
      if (err) {
        console.error(err);
        return;
      }
      let fileNameList = template.list(files);

      title = "WEB - create";
      let html = template.HTML(
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
      res.end(html);
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
      let filteredID = path.parse(title).base;
      fs.readFile(`./data/${filteredID}`, "utf8", (err, description) => {
        if (err) {
          console.error(err);
          return;
        }
        let fileNameList = template.list(files);
        let html = template.HTML(
          filteredID + " update",
          fileNameList,
          `
        <form action="/update_process" method="post">
        <input type="hidden" name="id" value="${filteredID}">
        <p><input type="text" name="title" placeholder="title" value="${filteredID}"></p>
        <p>
          <textarea name="description" placeholder="description">${description}</textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
      `,
          `
        <a href="/create">create</a> <a href="/update?id=${filteredID}">update</a>
        `
        );
        res.writeHead(200);
        res.end(html);
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
      let filteredID = path.parse(id).base;

      fs.unlink(`./data/${filteredID}`, (err) => {
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
