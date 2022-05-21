const {TokenType} = require('./common');

class Parser {

    static parse(tokens){
        const parser=new Parser(tokens);
        parser.parse();
        return parser.mqf;
    }

    constructor(tokens){
        this.tokens=tokens;
    }

    parse(){
        if (this.tokens.length<=0) return [];

        this.token=null;
        this.tokenIndex=-1;
        this.getToken();

        this.mqf={sections:[]};

        this.doMQF();
    }

    throwError(message) {
		let errorLine;
		if (this.token){
			errorLine=this.token.line;
		}else{
			errorLine=this.tokens[this.tokens.length-1].line;//Probably ran to the end of the token buffer, so just grab the last code line
		}
		throw new Error("Parser error on line "+errorLine+": "+message);
	}
    
	symbolToString(sym){
		return sym?sym.toString().replace("Symbol",""):null;
	}

	match(type) {
		if (this.token ? this.token.type === type : null) {
            const retVal = this.token.value;
			this.getToken();
            return retVal;
		}else{
			if (this.token){
				this.throwError("expected token type "+ this.symbolToString(type) + " but found "+this.symbolToString(this.token?this.token.type:null)+" instead");
			}else{
				this.throwError("expected token type "+ this.symbolToString(type) + " but found nothing!");
			}
		}
	}

    getToken(){
        this.tokenIndex++;
        if (this.tokenIndex>=this.tokens.length-1) this.token=null;
        this.token=this.tokens[this.tokenIndex];
        if (this.token && this.token.type===TokenType.End) this.token=null;
    }

    doQuestion(){
        const question=this.match(TokenType.Question);
        let expectAnswerIndex=0;
        const answers=[];
        let ref=null;
        const correct=[];

        while (this.token && (this.token.type===TokenType.Answer || this.token.type===TokenType.Ref)){
            if (this.token.type===TokenType.Answer){
                const answer = this.match(TokenType.Answer);

                if (answer.id!==expectAnswerIndex){
                    this.throwError('answers need to be in alphabetical order and no duplicates');
                }

                answers.push(answer.text);
                if (answer.correct) correct.push(expectAnswerIndex);

                expectAnswerIndex++;

            }else if (this.token.type===TokenType.Ref){
                if (ref) this.throwError('cannot have more than one ref per question');
                ref=this.match(TokenType.Ref);
            }
        }
        
        if (answers.length<2){
            this.throwError('questions need to have at least 2 possible answers');
        }

        if (correct.length<1){
            this.throwError('questions need to have at least 1 correct answer');
        }

        const questions = this.mqf.sections[this.mqf.sections.length-1].questions;
        questions.push({num: questions.length+1, question: question, choices: answers, ref: ref, correct: correct});
    }

    doQuestions(){
        while (this.token && this.token.type===TokenType.Question){
            this.doQuestion();
        }
    }

    doMQF(){
        while (this.token){
            const sectionName = this.match(TokenType.Section);
            this.mqf.sections.push({name: sectionName, questions:[]})
            this.doQuestions();
        }
    }
}

module.exports={Parser};