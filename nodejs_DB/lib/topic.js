const db = require("./db");
const template = require("./template");

exports.home = function (req, res) {
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

    res.writeHead(200);
    res.end(html);
  });
};
exports.page = function (req, res) {
  // 리스트의 각 항목 페이지
  let _url = req.url;
  let queryData = new URL("http://localhost:3000" + _url);
  let id = queryData.searchParams.get("id");

  db.query("SELECT * FROM topic", function (err, topics) {
    if (err) throw err;
    db.query(
      `SELECT * FROM topic LEFT JOIN author on topic.author_id=author.id WHERE topic.id=?`,
      [id],
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
  });
};
exports.create_process = function (req, res) {
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
};
exports.update = function (req, res) {
  // 페이지 수정 페이지
  let _url = req.url;
  let queryData = new URL("http://localhost:3000" + _url);
  let id = queryData.searchParams.get("id");

  db.query(`SELECT * FROM topic`, function (err, topics) {
    if (err) throw err;
    db.query(`SELECT * FROM topic WHERE id = ?`, [id], (err, topic) => {
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
        res.writeHead(200);
        res.end(html);
      });
    });
  });
};
exports.update_process = function (req, res) {
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
    console.log(post);

    db.query(
      `
            UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`,
      [title, description, author_id, id],
      function (error) {
        if (error) {
          throw error;
        }
        res.writeHead(302, { Location: `/?id=${id}` });
        res.end();
      }
    );
  });
};
exports.delete_process = function (req, res) {
  // 페이지 삭제 처리 부분
  let body = "";
  req.on("data", function (data) {
    body += data;
  });

  req.on("end", function () {
    let post = new URLSearchParams(body);

    let id = post.get("id");

    db.query(
      `
          DELETE FROM topic WHERE id=?`,
      [id],
      function (error) {
        if (error) {
          throw error;
        }
        res.writeHead(302, { Location: "/" });
        res.end();
      }
    );
  });
};
