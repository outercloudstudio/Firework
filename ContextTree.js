const util = require('util')

const Firework = require('./Firework')

const nativeFunctions = {
    rc: {
        params: [
            'INTEGER'
        ],

        return: 'NULL'
    }
}

function buildExpressionContext(expression){
    console.log('EXPRESSION CONTEXT:')
    console.log(util.inspect(expression, false, null, true))

    if(expression.value[0].value == '+' || expression.value[0].value == '-' || expression.value[0].value == '*' || expression.value[0].value == '/' || expression.value[0].value == '&&' || expression.value[0].value == '||' || expression.value[0].value == '==' || expression.value[0].value == '>' || expression.value[0].value == '<' || expression.value[0].value == '>=' || expression.value[0].value == '<='){
        if(expression.value[1].token == 'EXPRESSION'){
            expression.value[1] = buildExpressionContext(expression.value[1])
        }else if (expression.value[1].token == 'CALL'){
            expression.value[1] = buildCallContext(expression.value[1])
        }
        
        if(expression.value[2].token == 'EXPRESSION'){
            expression.value[2] = buildExpressionContext(expression.value[2])
        }else if (expression.value[2].token == 'CALL'){
            expression.value[2] = buildCallContext(expression.value[2])
        }
    }else if(expression.value[0].value == '!'){
        if(expression.value[1].token == 'EXPRESSION'){
            expression.value[1] = buildExpressionContext(expression.value[1])
        }else if (expression.value[1].token == 'CALL'){
            expression.value[1] = buildCallContext(expression.value[1])
        }
    }

    if(expression.value[0].value == '+' || expression.value[0].value == '-' || expression.value[0].value == '*'){
        if(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER'){
            expression.return = 'INTEGER'
        }else{
            return new Firework.Error(`Operation ${expression.value[0].value} can not be done one ${expression.value[1].token} and ${expression.value[2].token}!`)
        }
    }else if(expression.value[0].value == '/'){
        if(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER'){
            expression.return = 'FLOAT'
        }else{
            return new Firework.Error(`Operation ${expression.value[0].value} can not be done one ${expression.value[1].token} and ${expression.value[2].token}!`)
        }
    }else if(expression.value[0].value == '&&' || expression.value[0].value == '||'){
        if(expression.value[1].token == 'BOOLEAN' && expression.value[2].token == 'BOOLEAN'){
            expression.return = 'BOOLEAN'
        }else{
            return new Firework.Error(`Operation ${expression.value[0].value} can not be done one ${expression.value[1].token} and ${expression.value[2].token}!`)
        }
    }else if(expression.value[0].value == '>' || expression.value[0].value == '<' || expression.value[0].value == '>=' || expression.value[0].value == '<='){
        if(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER'){
            expression.return = 'BOOLEAN'
        }else{
            return new Firework.Error(`Operation ${expression.value[0].value} can not be done one ${expression.value[1].token} and ${expression.value[2].token}!`)
        }
    }else if(expression.value[0].value == '=='){
        expression.return = 'BOOLEAN'
    }

    return expression
}

function buildCallContext(call){
    console.log('CALL CONTEXT:')
    console.log(util.inspect(call, false, null, true))
    for(let i = 1; i < call.value.length; i++){
        if(call.value[i].token == 'CALL'){
            call.value[i] = buildCallContext(call.value[i])
        }else if(call.value[i].token == 'EXPRESSION'){
            call.value[i] = buildExpressionContext(call.value[i])
        }
    }

    return call
}

function buildContextTree(tree, globalContext = true) {
    for(let l = 0; l < tree.length; l++) {
        if(tree[l].token == 'BLOCK'){
            tree[l] = buildContextTree(tree[l])
        }else if(tree[l].token == 'CALL'){
            tree[l] = buildCallContext(tree[l])
        }
        
        /*if(tree[l].token == 'CALL'){
            const functionName = tree[l].value[0].value
            const functionParams = tree[l].value.slice(1)

            if(!nativeFunctions[functionName]){
                return(new Firework.Error(`Unkown method '${functionName}' was called!`))
            }
        }*/
    }

    return tree
}

module.exports = { buildContextTree }