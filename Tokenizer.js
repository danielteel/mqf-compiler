const TokenType = {
	LineDelim: Symbol("nl"),
	Character: Symbol("character"),
	Space: Symbol("space"),
	End: Symbol("end")
};


function isDigit(character){
	const charCode=character.charCodeAt(0);
	if (charCode>=48 && charCode<=57){
		return true;
	}
	return false;
}

function isAlpha(character){
	const charCode=character.charCodeAt(0);
	if ((charCode>=65 && charCode<=90) || (charCode>=97 && charCode<=122)){
		return true;
	}
	return false;
}

function isSpace(character){
	if (character.charCodeAt(0)<=32 && character!=='\n') return true;
	return false;
}

class Tokenizer {
	static newTokenObj(type, value, line) {
		return {type: type, value: value, line: line};
	}

	static get TokenType(){
		return TokenType;
	}

	static tokenize(code){
		const tokenizer=new Tokenizer();
		return tokenizer.tokenize(code);
	}

	setCode(code) {
		if (typeof code!=='string'){
			code='';
		}
		this.code = code;

		this.lookIndex = 0;
		this.look = this.code[0];
		this.codeEndIndex = this.code.length;
		this.currentCodeLine = 1;
		this.errorObj = null;

		this.tokens = [];
	}

	tokenize(code) {
		this.setCode(code);

		while (this.isNotEnd()) {
			this.next();
		}
		this.addToken(TokenType.End);

		return this.tokens;
	}


	addToken(type, value = null) {
		const newToken=Tokenizer.newTokenObj(type, value, this.currentCodeLine);

		if (this.tokens.length>0 && this.tokens[this.tokens.length-1].type===TokenType.Space && type===TokenType.LineDelim){
			this.tokens[this.tokens.length-1]=newToken;
			return;
		}else if (this.tokens.length>0 && this.tokens[this.tokens.length-1].type===TokenType.LineDelim && (type===TokenType.Space || type===TokenType.LineDelim)){
			return;
		}else if (this.tokens.length===0 && (type===TokenType.Space || type===TokenType.LineDelim)){
			return;
		}else{
			this.tokens.push(newToken);
		}
	}

	isNotEnd() {
		return this.lookIndex < this.codeEndIndex;
	}

	getChar() {
		if (this.isNotEnd()) {//should be impossible for this condition
			this.lookIndex++;
			this.look = this.code[this.lookIndex];
		}
	}

	skipWhite() {
		let numOfSpaces=0;
		while (this.isNotEnd() && isSpace(this.look)) {
			this.getChar();
			numOfSpaces++;
		}
		if (numOfSpaces){
			this.addToken(TokenType.Space, numOfSpaces);
		}
	}

	next() {
		this.skipWhite();
		if (this.isNotEnd()) {
			const symbol=this.look;
			this.getChar();
			if (symbol==='\n'){
				this.addToken(TokenType.LineDelim, symbol);
				this.currentCodeLine++;
			}else{
				this.addToken(TokenType.Character, symbol);
			}
		}
	}
}


module.exports={Tokenizer, TokenType};