const sanitizeHtml = require("sanitize-html");

module.exports = {
  HTML: function (title, fileNameList, description, control) {
    return `
      <!doctype html>
       <html>
       <head>
         <title>WEB2 - ${sanitizeHtml(title)}</title>
         <meta charset="utf-8">
       </head>
       <body>
         <h1><a href="/">WEB</a></h1>
         <a href="/author">author</a>
         <ol>
         ${fileNameList}
         </ol>
         ${control}
         <h2>${sanitizeHtml(title)}</h2>
         ${description}
       </body>
       </html>
         `;
  },
  list: function (topics) {
    //파일 목록 생성
    let i = 0;
    let fileNameList = "";
    while (topics.length > i) {
      fileNameList += `<li><a href="/?id=${sanitizeHtml(
        topics[i].id
      )}">${sanitizeHtml(topics[i].title)}</a></li>`;
      i++;
    }
    return fileNameList;
  },
  authorSelect: function (authors, author_id) {
    let tag = "";
    let i = 0;
    while (i < authors.length) {
      let selected = "";
      if (author_id === authors[i].id) {
        selected = " selected";
      }
      tag += `<option value="${sanitizeHtml(
        authors[i].id
      )}"${selected}>${sanitizeHtml(authors[i].name)}</option>`;
      i++;
    }
    return `<select name="author">
        ${tag}
      </select>`;
  },
  authorTable: function (authors) {
    let tag = "<table>";
    let i = 0;
    while (i < authors.length) {
      tag += `
        <tr>
          <td>${sanitizeHtml(authors[i].name)}</td>
          <td>${sanitizeHtml(authors[i].profile)}</td>
          <td><a href="/author/update?id=${sanitizeHtml(
            authors[i].id
          )}">update</td>
          <td>
            <form action="/author/delete_process" method="post">
            <input type="hidden" name="id" value="${sanitizeHtml(
              authors[i].id
            )}">
            <input type="submit" value="delete">
            </form>
          </td>
        </tr>
        `;
      i++;
    }
    tag += `</table>
      
    <style>
        table{
            border-collapse: collapse;
        }
        td{
            border:1px solid black;
        }
    </style>`;
    return tag;
  },
};
