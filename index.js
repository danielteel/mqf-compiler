const fs=require('fs');
const {Tokenizer, TokenType}=require('./Tokenizer');
const {Parser}=require('./Parser');

let file=process.argv[2];
if (!file) file='test-mqf/test.txt';


const contents=fs.readFileSync(file).toString();

const tokens=Tokenizer.tokenize(contents);

let mqf=Parser.parse(tokens);
fs.writeFileSync(file+'.json', JSON.stringify(mqf, null, '  '));
const htmlMQF=JSON.stringify(mqf, null).replaceAll("'", "\\'");

const header=fs.readFileSync('./data/shellstart.txt');
const footer=fs.readFileSync('./data/shellend.txt');
fs.writeFileSync(file+'.html', header);
fs.appendFileSync(file+'.html', htmlMQF);
fs.appendFileSync(file+'.html', footer);