const fs=require('fs');

const file=process.argv[2];

const contents=fs.readFileSync(file).toString();