module.exports = {
  HTML: function (title, fileNameList, description, control) {
    return `
      <!doctype html>
       <html>
       <head>
         <title>WEB2 - ${title}</title>
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
  },
  list: function (topics) {
    //파일 목록 생성
    let i = 0;
    let fileNameList = "";
    while (topics.length > i) {
      fileNameList += `<li><a href="/?id=${topics[i].id}">${topics[i].title}</a></li>`;
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
      tag += `<option value="${authors[i].id}"${selected}>${authors[i].name}</option>`;
      i++;
    }
    return `<select name="author">
        ${tag}
      </select>`;
  },
};
