const fs=require('fs');
const {Tokenizer, TokenType}=require('./Tokenizer');
const {Parser}=require('./Parser');

let title=process.argv[2];

let file=process.argv[3];
if (!file) file='test.txt';

const contents=fs.readFileSync(file).toString();

const tokens=Tokenizer.tokenize(contents);

let mqf=Parser.parse(tokens);
mqf={title, ...mqf};

fs.writeFileSync(file+'.json', JSON.stringify(mqf, null, '  '));