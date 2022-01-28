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

function getExpressionReturn(expression){

}

function buildContextTree(tree, globalContext = true) {
    for(let l = 0; l < tree.length; l++) {
        //Go Deeper Into Blocks
        for(let i = 0; i < tree[l].length; i++){
            if(tree[l][i].token == 'BLOCK'){
                tree[l][i].value = buildContextTree(tree[l][i].value)
            }
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