const {TokenType} = require('./common');

function isAlpha(character){
    const charCode=character.charCodeAt(0);
    if ((charCode>=65 && charCode<=90) || (charCode>=97 && charCode<=122)){
        return true;
    }
    return false;
}

function isSpace(character){
    if (character.charCodeAt(0)<=32) return true;
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

	throwError(message) {
		throw Error("Tokenizer error on line "+this.currentCodeLine+": "+message);
	}

    tokenize(code) {
        this.setCode(code);

        while (this.isNotEnd()) {
            this.next();
        }
        this.addToken(TokenType.End);

        return this.tokens;
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

    addToken(type, value = null) {
        const newToken=Tokenizer.newTokenObj(type, value, this.currentCodeLine);

        this.tokens.push(newToken);
    }

    isNotEnd() {
        return this.lookIndex < this.codeEndIndex;
    }

    getChar() {
        if (this.isNotEnd()) {//should be impossible for this condition
            if (this.look==='\n') this.currentCodeLine++;
            this.lookIndex++;
            this.look = this.code[this.lookIndex];
        }
    }

    skipWhite() {
        while (this.isNotEnd() && isSpace(this.look)) {
            this.getChar();
        }
    }


	getStringLiteral() {
		let stringTerminator=this.look;
        if (stringTerminator!=='"' && stringTerminator!=="'"){
            this.throwError('expected a string literal start character but got '+stringTerminator);
        }
		let str = "";
		this.getChar();
		while (this.isNotEnd() && this.look !== stringTerminator) {
			str += this.look;
			this.getChar();
		}
		if (!this.isNotEnd() && this.look !== stringTerminator) {
			this.throwError("expected string terminator but found end of code.");
		}
		this.getChar();
        this.skipWhite();
		return str;
	}

	getIdent() {
		let name = "";
		let notDone = true;

		while (this.isNotEnd() && notDone === true) {
			notDone = false;
			if (isAlpha(this.look)) {
				name += this.look;
				notDone = true;
				this.getChar();
			}
		}
        return name.toLowerCase();
    }

    readRestOfLine(){
        let text="";
        while (this.isNotEnd() && this.look!=='\n'){
            text+=this.look;
            this.getChar();
        }
        return text.trim();
    }

    otherThanSection(){
        if (this.look==='?'){
            this.getChar();
            this.addToken(TokenType.Question, this.readRestOfLine());
            return;
        }
        const savedIndex=this.lookIndex;

        let isCorrectAnswer=false;
        if (this.look==='*'){
            isCorrectAnswer=true;
            this.getChar();
            this.skipWhite();
        }

        let ident='';
        while (this.isNotEnd() && isAlpha(this.look)){
            ident+=this.look;
            this.getChar();
        }
        ident=ident.toLowerCase();

        this.skipWhite();

        const postSymbol = this.look;
        this.skipWhite();
        this.getChar();
        

        if (ident==='ref' && postSymbol===':'){
            this.addToken(TokenType.Ref, this.readRestOfLine());
            return;
        }
        if (ident.length===1 && postSymbol==='.'){
            const answerId = ident.toLowerCase().charCodeAt() - 'a'.charCodeAt();
            this.addToken(TokenType.Answer, {id: answerId, text: this.readRestOfLine(), correct: isCorrectAnswer});
            return;
        }
        
        this.lookIndex=savedIndex-1;
        this.getChar();
        this.addToken(TokenType.Question, this.readRestOfLine());
    }

    next() {
        this.skipWhite();
        if (this.isNotEnd()) {
            if (this.look===':'){
                this.getChar();
                this.addToken(TokenType.Section, this.readRestOfLine());
            } else if (this.look==='!'){
                this.getChar();
                this.addToken(TokenType.Title, this.readRestOfLine());
            } else if (this.look==='@'){
                this.getChar();
                const flag=this.getIdent();
                if (flag==='stripto'){
                    this.addToken(TokenType.StripTo, this.readRestOfLine());
                }else if (flag==='stripnum'){
                    const num=parseInt(this.readRestOfLine());
                    if (Number.isNaN(num)){
                        this.throwError('expected a number');
                    }
                    this.addToken(TokenType.StripNum, num);
                }else{
                    this.throwError('got unexpected flag of '+flag);
                }
            } else if (this.look==='>'){
                this.readRestOfLine();
            } else {
                this.otherThanSection();
            }
        }
    }
}


module.exports={Tokenizer, TokenType};