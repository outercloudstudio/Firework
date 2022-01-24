const util = require('util')

function generateETreeExpressions(tokens){
    //Create Parantheses Groups
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]

        if(token.token == 'SYMBOL' && token.value == '('){
            let prevToken = tokens[i - 1]

            if(!(prevToken && prevToken.token == 'NAME')){
                let endingIndex = -1

                for(let j = i + 1; j < tokens.length; j++){
                    const nextToken = tokens[j]

                    if(nextToken.token == 'SYMBOL' && nextToken.value == ')'){
                        endingIndex = j
                        break;
                    }
                }

                let insideTokens = tokens.slice(i + 1, endingIndex)

                //tokens.splice(i - 1, 3, { value: [token, prevToken, nextToken], token: 'EXPRESSION' })

                tokens.splice(i, endingIndex - i + 1, { value: generateETreeExpressions(insideTokens), token: 'EXPRESSION' })

                i--
            }
        }
    }

    //Create Expressions * and /
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]

        if(token.token == 'SYMBOL' && (token.value == '*' || token.value == '/')){
            let nextToken = tokens[i + 1]
            let prevToken = tokens[i - 1]

            if(prevToken && nextToken && (nextToken.token == 'INTEGER' || nextToken.token == 'EXPRESSION') && (nextToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION')){
                tokens.splice(i - 1, 3, { value: [token, prevToken, nextToken], token: 'EXPRESSION' })

                i--
            }
        }
    }

    //Create Expressions + and -
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]

        if(token.token == 'SYMBOL' && (token.value == '+' || token.value == '-')){
            let nextToken = tokens[i + 1]
            let prevToken = tokens[i - 1]

            if(prevToken && nextToken && (nextToken.token == 'INTEGER' || nextToken.token == 'EXPRESSION') && (nextToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION')){
                tokens.splice(i - 1, 3, { value: [token, prevToken, nextToken], token: 'EXPRESSION' })

                i--
            }
        }
    }

    return tokens
}

function generateETree(tokens){
    let inString = false
    let inStringIndex = -1

    //Remove Whitespace and Create Strings
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]

        if(token.token == 'SYMBOL' && (token.value == '"' || token.value == "'")){
            inString = !inString

            if(inString){
                inStringIndex = i
            }else{            
                let tokensInString = tokens.slice(inStringIndex + 1, i)

                let resultString = ''

                for(j in tokensInString){
                    resultString += tokensInString[j].value
                }

                tokens.splice(inStringIndex, i - inStringIndex + 1, { value: resultString, token: 'STRING' })

                i -= i - inStringIndex
            }
        }
        
        if(token.token == 'WHITESPACE' && !inString){
            tokens.splice(i, 1)

            i--
        }
    }

    //Combine Numbers
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]

        if(token.token == 'INTEGER'){
            let nextToken = tokens[i + 1]

            if(nextToken && nextToken.token == 'INTEGER'){
                tokens.splice(i, 2, { value: token.value + nextToken.value, token: 'INTEGER' })

                i--
            }
        }
    }

    tokens = generateETreeExpressions(tokens)

    return tokens
}

function generateFullETree(tokens){
    let lines = []

    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]

        if(token.token == 'NEWLINE'){
            lines.push(tokens.slice(0, i))

            tokens.splice(0, i + 1)

            i = 0
        }
    }

    lines.push(tokens.slice(0, tokens.length))

    tokens = lines

    for(let i = 0; i < tokens.length; i++){
        lines[i] = generateETree(tokens[i])
    }

    tokens = lines

    return lines
}

module.exports = { generateFullETree }