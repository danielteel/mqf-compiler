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
            if (this.look==='#'){
                this.getChar();
                this.addToken(TokenType.Section, this.readRestOfLine());
            } else {
                this.otherThanSection();
            }
        }
    }
}


module.exports={Tokenizer, TokenType};