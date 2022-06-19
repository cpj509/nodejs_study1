const http = require("http");
const fs = require("fs");
const template = require("./lib/template.js");
const path = require("path");
const sanitizeHtml = require("sanitize-html");
const mysql = require("mysql");
let db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "111111",
  database: "opentutorials",
});
db.connect();

let app = http.createServer(function (req, res) {
  let _url = req.url;
  let queryData = new URL("http://localhost:3000" + _url);
  let title = queryData.searchParams.get("id");
  let id = queryData.searchParams.get("id");
  let pathname = queryData.pathname;
  // console.log(pathname);
  if (pathname === "/") {
    if (id === null) {
      // 메인 페이지

      db.query("SELECT * FROM topic", function (error, topics) {
        if (error) throw error;

        let fileNameList = template.list(topics);

        let title = "Welcome";
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

      db.end();
    } else {
      // 리스트의 각 항목 페이지

      db.query("SELECT * FROM topic", function (error, topics) {
        if (error) throw error;
        db.query(
          `SELECT * FROM topic WHERE id=?`,
          [id],
          function (error2, topic) {
            if (error2) throw error;

            let fileNameList = template.list(topics);
            let title = topic[0].title;
            let description = topic[0].description;
            let html = template.HTML(
              title,
              fileNameList,
              description,
              `
              <a href="/create">create</a>
              <a href="/update?id=${id}">update</a>
              <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${id}">
                <input type="submit" value="delete">
              </form>
            `
            );
            res.writeHead(200);
            res.end(html);
          }
        );
        db.end();
      });
    }
  } else if (pathname === "/create") {
    // 페이지 생성 페이지

    db.query("SELECT * FROM topic", function (error, topics) {
      if (error) throw error;

      let fileNameList = template.list(topics);

      let title = "WEB - create";
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
      db.query(
        `
            INSERT INTO topic (title, description, created, author_id) 
              VALUES(?, ?, NOW(), ?)`,
        [title, description, 1],
        function (error, result) {
          if (error) {
            throw error;
          }
          res.writeHead(302, { Location: `/?id=${result.insertId}` });
          res.end();
        }
      );
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
