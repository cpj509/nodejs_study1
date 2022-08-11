const express = require("express");
const app = express();
const topic = require("./lib/topic");
const author = require("./lib/author");

const db = require("./lib/db");
const template = require("./lib/template");

const port = 3000;

app.get("/", (req, res) => {
  // 메인 페이지
  db.query("SELECT * FROM topic", function (err, topics) {
    if (err) throw err;

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

    res.send(html);
  });
});

app.get("/page/:pageId", (req, res) => {
  // 리스트의 각 항목 페이지
  let pageId = req.params.pageId;

  db.query("SELECT * FROM topic", function (err, topics) {
    if (err) throw err;

    db.query(
      `SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.title=?`,
      [pageId],
      function (err, topic) {
        if (err) throw err;

        let fileNameList = template.list(topics);
        let title = topic[0].title;
        let description = topic[0].description;
        let author = topic[0].name;

        let html = template.HTML(
          title,
          fileNameList,
          `${description} 
              <p>by ${author}</p>`,
          `
              <a href="/create">create</a>
              <a href="/update/${title}">update</a>
              <form action="/delete_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <input type="submit" value="delete">
              </form>
            `
        );
        res.send(html);
      }
    );
  });
});

app.get("/create", (req, res) => {
  // 페이지 생성 페이지
  db.query("SELECT * FROM topic", function (error, topics) {
    if (error) throw error;
    db.query(`SELECT * FROM author`, (err2, authors) => {
      if (err2) throw err2;
      let fileNameList = template.list(topics);

      let authorList = template.authorSelect(authors);
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
              ${authorList}
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `,
        ""
      );
      res.send(html);
    });
  });
});

app.post("/create_process", (req, res) => {
  // 페이지 생성 처리 부분
  let body = "";
  req.on("data", function (data) {
    body += data;
  });

  req.on("end", function () {
    let post = new URLSearchParams(body);
    let title = post.get("title");
    let description = post.get("description");
    let author = post.get("author");

    db.query(
      `
          INSERT INTO topic (title, description, created, author_id) 
            VALUES(?, ?, NOW(), ?)`,
      [title, description, author],
      function (error, result) {
        if (error) {
          throw error;
        }

        res.writeHead(302, { Location: `/?id=${result.insertId}` });
        res.end();
      }
    );
  });
});

app.get("/update/:pageID", (req, res) => {
  // 페이지 수정 페이지
  let id = req.params.pageID;

  db.query(`SELECT * FROM topic`, function (err, topics) {
    if (err) throw err;
    db.query(`SELECT * FROM topic WHERE title = ?`, [id], (err, topic) => {
      if (err) throw err;
      db.query(`SELECT * FROM author`, (err, authors) => {
        if (err) throw err;
        let fileNameList = template.list(topics);
        let html = template.HTML(
          topic[0].title + " update",
          fileNameList,
          `
      <form action="/update_process" method="post">
      <input type="hidden" name="id" value="${topic[0].id}">
      <p><input type="text" name="title" placeholder="title" value="${
        topic[0].title
      }"></p>
      <p>
        <textarea name="description" placeholder="description">${
          topic[0].description
        }</textarea>
      </p>
      <p>
        ${template.authorSelect(authors, topic[0].author_id)}
      </p>
      <p>
        <input type="submit">
      </p>
    </form>
    `,
          `
      <a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>
      `
        );
        res.send(html);
      });
    });
  });
});
app.post("/update_process", (req, res) => {
  // 페이지 수정 처리 부분
  let body = "";
  req.on("data", function (data) {
    body += data;
  });

  req.on("end", function () {
    let post = new URLSearchParams(body);

    let title = post.get("title");
    let description = post.get("description");
    let author_id = post.get("author");
    let id = post.get("id");

    db.query(
      `
             UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`,
      [title, description, author_id, id],
      function (error) {
        if (error) {
          throw error;
        }
        res.redirect("/page/" + title);
      }
    );
  });
});
app.post("/delete_process", (req, res) => {
  // 페이지 삭제 처리 부분
  let body = "";
  req.on("data", function (data) {
    body += data;
  });

  req.on("end", function () {
    let post = new URLSearchParams(body);
    let id = post.get("id");

    db.query(`DELETE FROM topic WHERE title=?`, [id], function (error) {
      if (error) {
        throw error;
      }
      res.redirect("/");
    });
  });
});

app.listen(port, () => {
  console.log(`Start server on port ${port}`);
});

/*
const http = require("http");
const topic = require("./lib/topic");
const author = require("./lib/author");

let app = http.createServer(function (req, res) {
  let _url = req.url;
  let queryData = new URL("http://localhost:3000" + _url);
  let id = queryData.searchParams.get("id");

  let pathname = queryData.pathname;

  if (pathname === "/") {
    if (id === null) {
      topic.home(req, res);
    } else {
      topic.page(req, res);
    }
  } else if (pathname === "/create") {
    topic.create(req, res);
  } else if (pathname === "/create_process") {
    topic.create_process(req, res);
  } else if (pathname === "/update") {
    topic.update(req, res);
  } else if (pathname === "/update_process") {
    topic.update_process(req, res);
  } else if (pathname === "/delete_process") {
    topic.delete_process(req, res);
  } else if (pathname === "/author") {
    author.home(req, res);
  } else if (pathname === "/author/create_process") {
    author.create_process(req, res);
  } else if (pathname === "/author/update") {
    author.update(req, res);
  } else if (pathname === "/author/update_process") {
    author.update_process(req, res);
  } else if (pathname === "/author/delete_process") {
    author.delete_process(req, res);
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});
app.listen(3000);

*/
