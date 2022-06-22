const http = require("http");
const topic = require("./lib/topic");

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
    topic.create(req, res);
  } else if (pathname === "/update") {
    topic.update(req, res);
  } else if (pathname === "/update_process") {
    topic.update_process(req, res);
  } else if (pathname === "/delete_process") {
    topic.delete_process(req, res);
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});
app.listen(3000);
