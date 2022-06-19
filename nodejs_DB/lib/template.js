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
  list: function (files) {
    //파일 목록 생성
    let i = 0;
    let fileNameList = "";
    while (files.length > i) {
      fileNameList += `<li><a href="/?id=${files[i]}">${files[i]}</a></li>`;
      i++;
    }
    return fileNameList;
  },
};
