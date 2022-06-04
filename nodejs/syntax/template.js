let name = "temp1";

let letter =
  "Quis " +
  name +
  " amet excepteur excepteur\n do amet ex excepteur commodo laborum. Esse Lorem aliquip mollit amet. Sint dolore laborum Lorem nulla cillum nostrud et reprehenderit. Id et minim voluptate qui.";

console.log(letter);
//따옴표 대신 백틱(tab키 위에 있는 버튼)으로 감싸주면 template literal 사용 가능.
letter = `Quis ${name} amet excepteur excepteur do amet ex excepteur commodo laborum. Esse Lorem aliquip mollit amet. Sint dolore laborum Lorem nulla cillum nostrud et reprehenderit. Id et minim voluptate qui.`;

console.log(letter);
