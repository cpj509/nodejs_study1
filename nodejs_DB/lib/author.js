const db = require("./db");
const template = require("./template");

exports.home = function (req, res) {
  // author 메인 페이지
  db.query("SELECT * FROM topic", function (err, topics) {
    if (err) throw err;
    db.query("SELECT * FROM author", function (err, authors) {
      if (err) throw err;
      let fileNameList = template.list(topics);
      let title = "Author";
      let description = template.authorTable(authors);

      let html = template.HTML(
        title,
        fileNameList,
        `${description}
        <form action="/author/create_process" method="post">
            <p>
                <input type="text" name="name" placeholder="name">
            </p>
            <p>
                <textarea name="profile" placeholder="description"></textarea>
            </p>
            <p>
                <input type="submit" value="create">
            </p>
        </form>
        `,
        ``
      );

      res.writeHead(200);
      res.end(html);
    });
  });
};
exports.create_process = function (req, res) {
  // author 생성 처리 부분
  let body = "";
  req.on("data", function (data) {
    body += data;
  });

  req.on("end", function () {
    let post = new URLSearchParams(body);
    let profile = post.get("profile");
    let name = post.get("name");

    db.query(
      `
          INSERT INTO author (name, profile) 
            VALUES(?, ?)`,
      [name, profile],
      function (error, result) {
        if (error) {
          throw error;
        }

        res.writeHead(302, { Location: `/author` });
        res.end();
      }
    );
  });
};
exports.update = function (req, res) {
  // author 수정 페이지
  let _url = req.url;
  let queryData = new URL("http://localhost:3000" + _url);
  let id = queryData.searchParams.get("id");

  db.query("SELECT * FROM topic", function (err, topics) {
    if (err) throw err;
    db.query("SELECT * FROM author", function (err, authors) {
      if (err) throw err;
      db.query("SELECT * FROM author WHERE id=?", [id], function (err, author) {
        if (err) throw err;
        let fileNameList = template.list(topics);
        let title = "Author";
        let description = template.authorTable(authors);

        let html = template.HTML(
          title,
          fileNameList,
          `${description}
            <form action="/author/update_process" method="post">
                <p>
                    <input type="hidden" name="id" value="${author[0].id}">
                </p>
                <p>
                    <input type="text" name="name" placeholder="name" value="${author[0].name}">
                </p>
                <p>
                    <textarea name="profile" placeholder="description">${author[0].profile}</textarea>
                </p>
                <p>
                    <input type="submit" value="update">
                </p>
            </form>
            `,
          ``
        );
        res.writeHead(200);
        res.end(html);
      });
    });
  });
};
exports.update_process = function (req, res) {
  // author 수정 처리 부분
  let body = "";
  req.on("data", function (data) {
    body += data;
  });

  req.on("end", function () {
    let post = new URLSearchParams(body);
    let profile = post.get("profile");
    let name = post.get("name");
    let id = post.get("id");

    db.query(
      `
          UPDATE author SET name=?, profile=? WHERE id=?`,
      [name, profile, id],
      function (error, result) {
        if (error) {
          throw error;
        }

        res.writeHead(302, { Location: `/author` });
        res.end();
      }
    );
  });
};
exports.delete_process = function (req, res) {
  // author 삭제 처리 부분
  let body = "";
  req.on("data", function (data) {
    body += data;
  });

  req.on("end", function () {
    let post = new URLSearchParams(body);

    let id = post.get("id");

    // author의 모든 글도 삭제
    db.query(
      `DELETE FROM topic WHERE author_id=?`,
      [id],
      function (err1, result1) {
        if (err1) throw err1;
        db.query(
          `
            DELETE FROM author WHERE id=?`,
          [id],
          function (err2, result2) {
            if (err2) throw err2;

            res.writeHead(302, { Location: "/author" });
            res.end();
          }
        );
      }
    );
  });
};
