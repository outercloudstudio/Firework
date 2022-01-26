const util = require('util')

function generateETreeFuncParams(tokens){
    //Create Function Params
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]

        if(token.token == 'SYMBOL' && token.value == '('){
            let prevToken = tokens[i - 1]

            if(prevToken && prevToken.token == 'NAME'){
                let endingIndex = -1

                for(let j = i + 1; j < tokens.length; j++){
                    const nextToken = tokens[j]

                    if(nextToken.token == 'SYMBOL' && nextToken.value == ')'){
                        endingIndex = j
                        break;
                    }
                }

                let insideTokens = tokens.slice(i + 1, endingIndex)

                //tokens.splice(i, endingIndex - i + 1, { value: generateETreeExpressions(insideTokens), token: 'FUNCTIONPARAM' })

                i--
            }
        }
    }
}

function splitLines(tokens){
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]

        const nextToken = tokens[i + 1]

        if(token.token == 'NEWLINE' && nextToken && nextToken.token == 'NEWLINE'){
            tokens.splice(i, 1)
            tokens[i].value = '\n'

            i--
        }
    }

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

    return lines
}

function buildCodeBlocks(tokens){
    let openPaths = []

    for(let x = 0; x < tokens.length; x++){
        for(let y = 0; y < tokens[x].length; y++){
            if(tokens[x][y].value == '{' && tokens[x][y].token == 'SYMBOL'){
                openPaths.push({ x: x, y: y })
            }

            if(tokens[x][y].value == '}' && tokens[x][y].token == 'SYMBOL'){
                let openPath = openPaths.pop()

                let inBlockLines = []

                for(let i = openPath.x; i <= x; i++){
                    if(i == openPath.x){
                        inBlockLines.push(tokens[i].slice(openPath.y + 1, tokens[i].length))
                    }else if(i == x){
                        inBlockLines.push(tokens[i].slice(0, y))
                    }else{
                        inBlockLines.push(tokens[i])
                    }
                }

                for(let i = 0; i < inBlockLines.length; i++){
                    if(inBlockLines[i].length == 0){
                        inBlockLines.splice(i, 1)
                        i--
                    }
                }

                tokens[openPath.x].splice(openPath.y, tokens[openPath.x].length, { value: inBlockLines, token: 'BLOCK' })

                tokens[x].splice(0, y + 1)

                if(x - openPath.x > 1){
                    tokens.splice(openPath.x + 1, x - openPath.x - 1)
                }

                x -= x - openPath.x - 1
            }
        }
    }

    return tokens
}

function buildCompoundTypes(tokens){
    for(let l = 0; l < tokens.length; l++){
        let inString = false
        let inStringIndex = -1

        //Go Deeper Into Blocks
        for(let i = 0; i < tokens[l].length; i++){
            if(tokens[l][i].token == 'BLOCK'){
                tokens[l][i].value = buildCompoundTypes(tokens[l][i].value)
            }
        }

        //Remove Whitespace and Create Strings
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]

            if(token.token == 'SYMBOL' && (token.value == '"' || token.value == "'")){
                inString = !inString

                if(inString){
                    inStringIndex = i
                }else{            
                    let tokensInString = tokens[l].slice(inStringIndex + 1, i)

                    let resultString = ''

                    for(j in tokensInString){
                        resultString += tokensInString[j].value
                    }

                    tokens[l].splice(inStringIndex, i - inStringIndex + 1, { value: resultString, token: 'STRING' })

                    i -= i - inStringIndex
                }
            }
            
            if(token.token == 'WHITESPACE' && !inString){
                tokens[l].splice(i, 1)

                i--
            }
        }

        //Combine Numbers
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]

            if(token.token == 'INTEGER'){
                let nextToken = tokens[l][i + 1]

                if(nextToken && nextToken.token == 'INTEGER'){
                    tokens[l].splice(i, 2, { value: token.value + nextToken.value, token: 'INTEGER' })

                    i--
                }
            }
        }

        //Build Flags
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]
            const prevToken = tokens[l][i - 1]

            if(token.token == 'NAME' && prevToken && prevToken.token == 'SYMBOL' && prevToken.value == '$'){
                tokens[l].splice(i - 1, 2, { value: token.value, token: 'FLAG' })

                i--
            }
        }
    }

    return tokens
}

function buildExpressionsSingle(tokens){
    //Create Parantheses Groups
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]

        if(token.token == 'SYMBOL' && token.value == '('){
            let prevToken = tokens[i - 1]

            if(!(prevToken && (prevToken.token == 'NAME' || prevToken.token == 'KEYWORD'))){
                let endingIndex = -1

                for(let j = i + 1; j < tokens.length; j++){
                    const nextToken = tokens[j]

                    if(nextToken.token == 'SYMBOL' && nextToken.value == ')'){
                        endingIndex = j
                        break;
                    }
                }

                let insideTokens = tokens.slice(i + 1, endingIndex)

                tokens.splice(i, endingIndex - i + 1, { value: buildExpressionsSingle(insideTokens), token: 'EXPRESSION' })

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

            if(prevToken && nextToken && (nextToken.token == 'INTEGER' || nextToken.token == 'EXPRESSION') && (prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION')){
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

            if(prevToken && nextToken && (nextToken.token == 'INTEGER' || nextToken.token == 'EXPRESSION') && (prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION')){
                tokens.splice(i - 1, 3, { value: [token, prevToken, nextToken], token: 'EXPRESSION' })

                i--
            }
        }
    }

    //Create Expressions !
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]

        if(token.token == 'SYMBOL' && token.value == '!'){
            let nextToken = tokens[i + 1]

            if(nextToken && (nextToken.token == 'EXPRESSION' || nextToken.token == 'FLAG')){
                tokens.splice(i, 2, { value: [token, nextToken], token: 'EXPRESSION' })
            }
        }
    }

    //Create Expressions == > < >= <=
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]
        const nextToken = tokens[i + 1]

        if(token.token == 'SYMBOL' && (token.value == '=' || token.value == '>' || token.value == '<')){
            let prevToken = tokens[i - 1]

            if(prevToken && nextToken){
                if(nextToken.token == 'SYMBOL' && nextToken.value == '='){
                    let nextNextToken = tokens[i + 2]
                    
                    if(token.value == '>' || token.value == '<'){
                      if((nextNextToken.token == 'INTEGER' || nextNextToken.token == 'EXPRESSION') && (prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION')){
                          const newToken = { value: token.value + nextToken.value, token: 'SYMBOL' }
                          
                          tokens.splice(i - 1, 4, { value: [newToken, prevToken, nextNextToken], token: 'EXPRESSION' })

                          i--
                      }
                    }else{
                      if((nextNextToken.token == 'INTEGER' || nextNextToken.token == 'EXPRESSION' || nextNextToken.token == 'BOOLEAN') && (prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION' || nextNextToken.token == 'BOOLEAN')){
                          const newToken = { value: token.value + nextToken.value, token: 'SYMBOL' }
                          
                          tokens.splice(i - 1, 4, { value: [newToken, prevToken, nextNextToken], token: 'EXPRESSION' })

                          i--
                      }
                    }
                }else if(token.value == '>' || token.value == '<'){
                    if((nextToken.token == 'INTEGER' || nextToken.token == 'EXPRESSION') && (prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION')){
                        tokens.splice(i - 1, 4, { value: [token, prevToken, nextToken], token: 'EXPRESSION' })

                        i--
                    }
                }
            }
        }
    }

    //Create Expressions || and &&
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]
        const nextToken = tokens[i + 1]

        if(token.token == 'SYMBOL' && nextToken && nextToken.token == 'SYMBOL' && ((token.value == '|' && nextToken.value == '|') || (token.value == '&' && nextToken.value == '&'))){
            let nextNextToken = tokens[i + 2]
            let prevToken = tokens[i - 1]

            if(prevToken && nextToken && (nextNextToken.token == 'FLAG' || nextNextToken.token == 'EXPRESSION') && (prevToken.token == 'FLAG' || prevToken.token == 'EXPRESSION')){
                const newToken = { value: token.value + nextToken.value, token: 'SYMBOL' }
                
                tokens.splice(i - 1, 4, { value: [newToken, prevToken, nextNextToken], token: 'EXPRESSION' })

                i--
            }
        }
    }

    console.log('Built Expressions Single:')
    console.log(util.inspect(tokens, false, null, true))
    console.log('')

    return tokens
}

function buildExpressions(tokens){
    for(let l = 0; l < tokens.length; l++){
        //Go Deeper Into Blocks
        for(let i = 0; i < tokens[l].length; i++){
            if(tokens[l][i].token == 'BLOCK'){
                tokens[l][i].value = buildExpressions(tokens[l][i].value)
            }
        }

        tokens[l] = buildExpressionsSingle(tokens[l])
    }

    return tokens
}

function generateETree(tokens){
    tokens = splitLines(tokens)
    
    tokens = buildCodeBlocks(tokens)

    for(let i = 0; i < tokens.length; i++){
        if(tokens[i].length == 0){
            tokens.splice(i, 1)
            i--
        }
    }

    tokens = buildCompoundTypes(tokens)

    tokens = buildExpressions(tokens)

    return tokens
}

module.exports = { generateETree }