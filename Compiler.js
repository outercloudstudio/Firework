const util = require('util')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const Firework = require('./Firework')


function compile(tree){
    fs.copyFileSync('./world_runtime_template.json', './world_runtime.json')

    let worldRuntime = JSON.parse(fs.readFileSync('./world_runtime.json').toString())

    let blocks = {}

    let dynamicVariables = {}

    let constants = {}

    function optomizeExpression(expression){
        let dynamic = false

        if(expression.value[0].value == '+' || expression.value[0].value == '-' || expression.value == '*'[0].value || expression.value == '/'[0].value || expression.value[0].value == '&&' || expression.value[0].value == '||' || expression.value[0].value == '==' || expression.value[0].value == '>' || expression.value[0].value == '<' || expression.value[0].value == '>=' || expression.value[0].value == '<='){
            if(expression.value[1].token == 'EXPRESSION'){
                expression.value[1] = optomizeExpression(expression.value[1])
            }

            if(expression.value[2].token == 'EXPRESSION'){
                expression.value[2] = optomizeExpression(expression.value[2])
            }
            
            if(expression.value[1].dynamic || expression.value[2].dynamic){
                dynamic = true
            }

            if(expression.value[1].token == 'FLAG' || expression.value[2].token == 'FLAG'){
                dynamic = true
            }
        }else if(expression.value[0].value == '!'){
            if(expression.value[1].token == 'EXPRESSION'){
                expression.value[1] = optomizeExpression(expression.value[1])
            }

            if(expression.value[1].dynamic){
                dynamic = true
            }

            if(expression.value[1].token == 'FLAG'){
                dynamic = true
            }
        }

        if(dynamic){
            expression.dynamic = true
        }else{
            if(expression.value[0].value == '+'){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    console.log(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}`)
                    return new Firework.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}`)
                }

                expression = { value: (parseInt(expression.value[1].value) + parseInt(expression.value[2].value)).toString(), token: 'INTEGER' }
            }else if(expression.value[0].value == '-'){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    console.log(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}`)
                    return new Firework.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}`)
                }

                expression = { value: (parseInt(expression.value[1].value) - parseInt(expression.value[2].value)).toString(), token: 'INTEGER' }
            }else if(expression.value[0].value == '*'){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    console.log(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}`)
                    return new Firework.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}`)
                }

                expression = { value: (parseInt(expression.value[1].value) * parseInt(expression.value[2].value)).toString(), token: 'INTEGER' }
            }else if(expression.value[0].value == '+'){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    console.log(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}`)
                    return new Firework.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}`)
                }

                expression = { value: (parseInt(expression.value[1].value) / parseInt(expression.value[2].value)).toString(), token: 'FLOAT' }
            }else if(expression.value[0].value == '>'){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    console.log(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}`)
                    return new Firework.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}`)
                }

                expression = { value: (parseInt(expression.value[1].value) > parseInt(expression.value[2].value)).toString(), token: 'BOOLEAN' }
            }else if(expression.value[0].value == '<'){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    console.log(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}`)
                    return new Firework.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}`)
                }

                expression = { value: (parseInt(expression.value[1].value) < parseInt(expression.value[2].value)).toString(), token: 'BOOLEAN' }
            }else if(expression.value[0].value == '>='){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    console.log(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}`)
                    return new Firework.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}`)
                }

                expression = { value: (parseInt(expression.value[1].value) >= parseInt(expression.value[2].value)).toString(), token: 'BOOLEAN' }
            }else if(expression.value[0].value == '<='){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    console.log(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}`)
                    return new Firework.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}`)
                }

                expression = { value: (parseInt(expression.value[1].value) <= parseInt(expression.value[2].value)).toString(), token: 'BOOLEAN' }
            }else if(expression.value[0].value == '&&'){
                if(!(expression.value[1].token == 'BOOLEAN' && expression.value[2].token == 'BOOLEAN')){
                    console.log(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}`)
                    return new Firework.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}`)
                }

                expression = { value: (expression.value[1].value == 'true' && expression.value[2].value == 'true').toString(), token: 'BOOLEAN' }
            }else if(expression.value[0].value == '||'){
                if(!(expression.value[1].token == 'BOOLEAN' && expression.value[2].token == 'BOOLEAN')){
                    console.log(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}`)
                    return new Firework.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}`)
                }

                expression = { value: (expression.value[1].value == 'true' || expression.value[2].value == 'true').toString(), token: 'BOOLEAN' }
            }else if(expression.value[0].value == '!'){
                if(!(expression.value[1].token == 'BOOLEAN')){
                    console.log(`Can not do operation ${expression.value[0].value} on type ${expression.value[1].token}`)
                    return new Firework.Error(`Can not do operation ${expression.value[0].value} on type ${expression.value[1].token}`)
                }

                expression = { value: (expression.value[1].value != 'true').toString(), token: 'BOOLEAN' }
            }else if(expression.value[0].value == '=='){
                if(expression.value[1].token != expression.value[2].token){
                    expression = { value: 'false', token: 'BOOLEAN' }
                }else{
                    expression = { value: (expression.value[1].value == expression.value[2].value).toString(), token: 'BOOLEAN' }
                }
            }
        }

        return expression
    }

    function searchForExpression(tree){
        if(tree.token == 'DEFINITION' || tree.token == 'IF' || tree.token == 'DELAY'){
            tree = searchForExpression(tree.value[1].value)
        }else if(tree.token == 'ASSIGN' && tree.value[0].value == 'const'){
            if(tree.value[2].token == 'EXPRESSION'){
                tree.value[2] = optomizeExpression(tree.value[2])
            }
        }else if(tree.token == 'CALL'){
            for(let i = 1; i < tree.value.length; i++){
                if(tree.value[i].token == 'EXPRESSION'){
                    tree.value[i] = optomizeExpression(tree.value[i])
                }
            }
        }

        return tree
    }

    function indexCodeBlock(block, mode, preferedID = null){
        for(let i = 0; i < block.value.length; i++){
            block.value[i] = searchForCodeBlock(block.value[i])
        }

        let ID = uuidv4()

        if(preferedID != null && !blocks[preferedID]){
            ID = preferedID
        }

        blocks[ID] = block.value

        block = { value: [ID, mode], token: 'BLOCKREF'}

        return block
    }

    function searchForCodeBlock(tree){
        if(tree.token == 'DEFINITION'){
            tree = indexCodeBlock(tree.value[1], 'normal')
        }else if(tree.token == 'IF'){
            tree = indexCodeBlock(tree.value[1], 'conditional')
        }else if(tree.token == 'DELAY'){
            tree = indexCodeBlock(tree.value[1], 'delay')
        }

        return tree
    }

    for(let i = 0; i < tree.length; i++){
        tree[i] = searchForExpression(tree[i])
    }

    for(let i = 0; i < tree.length; i++){
        if(tree[i].token == 'ASSIGN'){
            if(tree[i].value[0].value == 'const'){
                if(tree[i].value[2].token == 'EXPRESSION' || tree[i].value[2].dynamic){
                    console.log(`Can not assign dyncamic value to const ${tree[i].value[1].value}!`)
                    return new Firework.Error(`Can not assign dyncamic value to const ${tree[i].value[1].value}!`)
                }

                if(constants[tree[i].value[1].value]){
                    console.log(`Can not initialize constant ${tree[i].value[1].value} more than once!`)
                    return new Firework.Error(`Can not initialize constant ${tree[i].value[1].value} more than once!`)
                }

                constants[tree[i].value[1].value] = tree[i].value[2]
            }
        }
    }

    for(let i = 0; i < tree.length; i++){
        tree[i] = searchForCodeBlock(tree[i])
    }

    const blockNames = Object.getOwnPropertyNames(blocks)

    for(let i = 0; i < blockNames.length; i++){
        let data = {
            sequence: []
        }

        for(let l = 0; l < blocks[blockNames[i]].length; l++){
            if(blocks[blockNames[i]][l].token == 'CALL'){
                if(blocks[blockNames[i]][l].value[0].value == 'rc'){
                    data.sequence.push({
                        run_command: {
                            command: [
                                blocks[blockNames[i]][l].value[1].value
                            ]
                        }
                    })
                }
            }else if(blocks[blockNames[i]][l].token == 'BLOCKREF'){
                if(blocks[blockNames[i]][l].value[1] == 'normal'){
                    data.sequence.push({
                        run_command: {
                            command: [
                                'event entity @s frw:' + blocks[blockNames[i]][l].value[0]
                            ]
                        }
                    })
                }else if(blocks[blockNames[i]][l].value[1] == 'conditional'){
                    data.sequence.push({
                        filters: {
							test: 'has_tag',
							value: 'exanmple_condition'
						},
                        run_command: {
                            command: [
                                'event entity @s frw:' + blocks[blockNames[i]][l].value[0]
                            ]
                        }
                    })
                }else if(blocks[blockNames[i]][l].value[1] == 'delay'){
                    data.sequence.push({
                        run_command: {
                            command: [
                                'event entity @s frw:' + blocks[blockNames[i]][l].value[0]
                            ]
                        }
                    })
                }
            }
        }

        worldRuntime['minecraft:entity'].events['frw:' + blockNames[i]] = data
    }

    fs.writeFileSync('./world_runtime.json', JSON.stringify(worldRuntime, null, 4))
}

module.exports = { compile }