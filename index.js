const fs=require('fs');
const {Tokenizer, TokenType}=require('./Tokenizer.js');

const file=process.argv[2];

const contents=fs.readFileSync(file).toString();

const tokens=Tokenizer.tokenize(contents);

console.log(tokens.length);