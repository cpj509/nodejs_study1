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
