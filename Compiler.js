const util = require('util')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const Firework = require('./Firework')


function compile(tree){
    //console.log(util.inspect(tree, false, null, true /* enable colors */))

    fs.copyFileSync('./world_runtime_template.json', './world_runtime.json')

    if(fs.existsSync('./animations')){
        fs.rmSync('./animations', { recursive: true })
    }

    fs.mkdirSync('./animations')

    let worldRuntime = JSON.parse(fs.readFileSync('./world_runtime.json').toString())

    let blocks = {}

    let dynamicVariables = {}

    let dynamicValues = {}

    let constants = {}

    let flags = []

    function expressionToMolang(expression){
        console.log('EXP TO MOL: ' + expression.token)
        console.log(util.inspect(expression, false, null, true /* enable colors */))

        let result = ''

        if(expression.token == 'INTEGER' || expression.token == 'BOOLEAN'){
            result = expression.value
        }else if(expression.token == 'MOLANG'){
            result = '(' + expression.value + ')'
        }else if(expression.token == 'EXPRESSION'){
            if(expression.value[0].value == '!'){
                result = expressionToMolang(expression.value[1]) + ' == 0'
            }else{
                result = expressionToMolang(expression.value[1]) + ' ' + expression.value[0].value + ' ' + expressionToMolang(expression.value[2])
            }
        }else if(expression.token == 'FLAG'){
            result = `q.actor_property('frw:${expression.value}')`
        }else if(expression.token == 'CALL'){
            if(expression.value[0].value == 'rand'){
                console.log('GOT RAND')
                result = `(math.die_roll(1, 0, 1) > 0.45)`
            }
        }

        console.log('RET: ' + result)

        return result
    }

    function optimizeExpression(expression){
        console.log('OPTOMIZE: ' + expression.token)

        let dynamic = false

        if(expression.token == 'SYMBOL' && (expression.value[0].value == '+' || expression.value[0].value == '-' || expression.value == '*'[0].value || expression.value == '/'[0].value || expression.value[0].value == '&&' || expression.value[0].value == '||' || expression.value[0].value == '==' || expression.value[0].value == '>' || expression.value[0].value == '<' || expression.value[0].value == '>=' || expression.value[0].value == '<=')){
            if(expression.value[1].token == 'EXPRESSION'){
                expression.value[1] = optimizeExpression(expression.value[1])
            }

            if(expression.value[2].token == 'EXPRESSION'){
                expression.value[2] = optimizeExpression(expression.value[2])
            }
            
            if(expression.value[1].dynamic || expression.value[2].dynamic){
                dynamic = true
            }

            if(expression.value[1].token == 'FLAG' || expression.value[2].token == 'FLAG'){
                dynamic = true
            }

            if(expression.value[1].token == 'MOLANG' || expression.value[2].token == 'MOLANG'){
                dynamic = true
            }
        }else if(expression.token == 'SYMBOL' && (expression.value[0].value == '!')){
            if(expression.value[1].token == 'EXPRESSION'){
                expression.value[1] = optimizeExpression(expression.value[1])
            }

            if(expression.value[1].dynamic){
                dynamic = true
            }

            if(expression.value[1].token == 'FLAG'){
                dynamic = true
            }

            if(expression.value[1].token == 'MOLANG'){
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
            tree.value[1].value = searchForExpression(tree.value[1].value)
        }else if(tree.token == 'ASSIGN' && tree.value[0].value == 'const'){
            if(tree.value[2].token == 'EXPRESSION'){
                tree.value[2] = optimizeExpression(tree.value[2])
            }
        }else if(tree.token == 'CALL'){
            for(let i = 1; i < tree.value.length; i++){
                if(tree.value[i].token == 'EXPRESSION'){
                    tree.value[i] = optimizeExpression(tree.value[i])
                }
            }
        }

        return tree
    }

    function indexCodeBlock(block, mode, condition = null, preferedID = null){
        for(let i = 0; i < block.value.length; i++){
            block.value[i] = searchForCodeBlock(block.value[i])
        }

        let ID = uuidv4()

        if(preferedID != null && !blocks[preferedID]){
            ID = preferedID
        }

        if(mode == 'conditional'){
            let molang = expressionToMolang(condition)

            dynamicValues[ID] = {
                condition: molang
            }
        }

        blocks[ID] = block.value

        block = { value: [ID, mode], token: 'BLOCKREF'}

        console.log('INDEXED BLOCK: ' + ID)

        return block
    }

    function indexConstant(token){
        if(token.value[2].token == 'EXPRESSION' || token.value[2].dynamic){
            console.log(`Can not assign dyncamic value to const ${token.value[1].value}!`)
            return new Firework.Error(`Can not assign dyncamic value to const ${token.value[1].value}!`)
        }

        if(constants[token.value[1].value]){
            console.log(`Can not initialize constant ${token.value[1].value} more than once!`)
            return new Firework.Error(`Can not initialize constant ${token.value[1].value} more than once!`)
        }

        constants[token.value[1].value] = token.value[2]
    }

    function searchForCodeBlock(tree){
        if(tree.token == 'DEFINITION'){
            tree.value[1] = indexCodeBlock(tree.value[1], 'normal', null, tree.value[0].value)
        }else if(tree.token == 'IF'){
            tree.value[1] = indexCodeBlock(tree.value[1], 'conditional', tree.value[0])
        }else if(tree.token == 'DELAY'){
            tree.value[1] = indexCodeBlock(tree.value[1], 'delay')
        }

        return tree
    }

    function indexFlag(flag){
        flags.push(flag.value)
    }

    function searchForFlags(tree){
        if(tree.token == 'DEFINITION' || tree.token == 'IF' || tree.token == 'DELAY'){

            if(tree.value[0].token == 'EXPRESSION'){
                tree.value[0] = searchForFlags(tree.value[0])
            }else if(tree.value[0].token == 'FLAG'){
                indexFlag(tree.value[0])
            }

            for(let i = 0; i < tree.value[1].value.length; i++){
                tree.value[1].value[i] = searchForFlags(tree.value[1].value[i])
            }
        }else if(tree.token == 'ASSIGN' && tree.value[0].token == 'FLAG'){
            indexFlag(tree.value[0])
        }

        return tree
    }

    for(let i = 0; i < tree.length; i++){
        tree[i] = searchForExpression(tree[i])
    }

    for(let i = 0; i < tree.length; i++){
        if(tree[i].token == 'ASSIGN'){
            if(tree[i].value[0].value == 'const'){
                indexConstant(tree[i])
            }
        }
    }

    for(let i = 0; i < tree.length; i++){
        tree[i] = searchForFlags(tree[i])
    }

    for(let i = 0; i < tree.length; i++){
        tree[i] = searchForCodeBlock(tree[i])
    }

    for(let i = 0; i < flags.length; i++){
        let data = {
            default: 0,
            values: [
                0,
                1
            ]
        }

        worldRuntime['minecraft:entity'].description.properties['frw:' + flags[i]] = data

        let eventData = {
            set_actor_property: {}
        }
        
        eventData.set_actor_property['frw:' + flags[i]] = 1

        worldRuntime['minecraft:entity'].events['frw:set_' + flags[i]] = eventData

        eventData = {
            set_actor_property: {}
        }
        
        eventData.set_actor_property['frw:' + flags[i]] = 0

        worldRuntime['minecraft:entity'].events['frw:unset_' + flags[i]] = eventData
    }

    const dynamicValueNames = Object.getOwnPropertyNames(dynamicValues)

    for(let i = 0; i < dynamicValueNames.length; i++){
        let data = {
            default: 0,
            values: [
                0,
                1
            ]
        }

        worldRuntime['minecraft:entity'].description.properties['frw:' + dynamicValueNames[i]] = data

        let animCont = {
            "format_version": "1.10.0",
            "animations": {}
        }

        animCont.animations['animation.firework.runtime.' + dynamicValueNames[i]] = {
            "loop": true,
            "timeline": {
                "0.0": [
                    `/tag @s add frw_conditional_${dynamicValueNames[i]}`
                ]
            },
            "animation_length": 0.001
        }

        fs.writeFileSync('./animations/frw_' + dynamicValueNames[i] + '.json', JSON.stringify(animCont, null, 4))

        worldRuntime['minecraft:entity'].description.animations[dynamicValueNames[i]] = 'animation.firework.runtime.' + dynamicValueNames[i]

        let animData = {}

        animData[dynamicValueNames[i]] = dynamicValues[dynamicValueNames[i]].condition

        worldRuntime['minecraft:entity'].description.scripts.animate.push(animData)

        animCont = {
            "format_version": "1.10.0",
            "animations": {}
        }

        animCont.animations['animation.firework.runtime.' + dynamicValueNames[i] + '.inverse'] = {
            "loop": true,
            "timeline": {
                "0.0": [
                    `/tag @s remove frw_conditional_${dynamicValueNames[i]}`
                ]
            },
            "animation_length": 0.001
        }

        fs.writeFileSync('./animations/frw_' + dynamicValueNames[i] + '_inverse.json', JSON.stringify(animCont, null, 4))

        worldRuntime['minecraft:entity'].description.animations[dynamicValueNames[i] + '_inverse'] = 'animation.firework.runtime.' + dynamicValueNames[i] + '.inverse'

        animData = {}

        animData[dynamicValueNames[i] + '_inverse'] = '(' + dynamicValues[dynamicValueNames[i]].condition + ') == 0'

        worldRuntime['minecraft:entity'].description.scripts.animate.push(animData)
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
                                '/' + blocks[blockNames[i]][l].value[1].value
                            ]
                        }
                    })
                }else{
                    if(blocks[blocks[blockNames[i]][l].value[0].value]){
                        data.sequence.push({
                            run_command: {
                                command: [
                                    `/event entity @s frw:${blocks[blockNames[i]][l].value[0].value}`
                                ]
                            }
                        })
                    }
                }
            }else if(blocks[blockNames[i]][l].token == 'DEFINITION' || blocks[blockNames[i]][l].token == 'IF' || blocks[blockNames[i]][l].token == 'DELAY'){
                if(blocks[blockNames[i]][l].value[1].value[1] == 'normal'){
                    data.sequence.push({
                        run_command: {
                            command: [
                                '/event entity @s frw:' + blocks[blockNames[i]][l].value[1].value[0]
                            ]
                        }
                    })
                }else if(blocks[blockNames[i]][l].value[1].value[1] == 'conditional'){
                    data.sequence.push({
                        run_command: {
                            command: [
                                `/event entity @s[tag=frw_conditional_${blocks[blockNames[i]][l].value[1].value[0]}] frw:` + blocks[blockNames[i]][l].value[1].value[0]
                            ]
                        }
                    })
                }else if(blocks[blockNames[i]][l].value[1].value[1] == 'delay'){
                    data.sequence.push({
                        run_command: {
                            command: [
                                '/event entity @s frw:' + blocks[blockNames[i]][l].value[1].value[0]
                            ]
                        }
                    })
                }
            }else if(blocks[blockNames[i]][l].token == 'ASSIGN'){
                if(blocks[blockNames[i]][l].value[1].value == 'true'){
                    data.sequence.push(
                        {
                            run_command: {
                                command: [
                                    `/event entity @s frw:set_${blocks[blockNames[i]][l].value[0].value}`
                                ]
                            }
                        }
                    )
                }else{
                    data.sequence.push(
                        {
                            run_command: {
                                command: [
                                    `/event entity @s frw:unset_${blocks[blockNames[i]][l].value[0].value}`
                                ]
                            }
                        }
                    )
                }
            }
        }

        worldRuntime['minecraft:entity'].events['frw:' + blockNames[i]] = data
    }

    let updateData = {
        "format_version": "1.10.0",
        "animations": {}
    }

    const updateID = uuidv4()

    updateData.animations['animation.firework.runtime.' + updateID + '.update'] = {
        "loop": true,
        "timeline": {
            "0.0": [
                `/event entity @s frw:update`
            ]
        },
        "animation_length": 0.001
    }

    fs.writeFileSync('./animations/frw_' + updateID + '_update.json', JSON.stringify(updateData, null, 4))

    worldRuntime['minecraft:entity'].description.animations['frw_update'] = 'animation.firework.runtime.' + updateID + '.update'

    fs.writeFileSync('./world_runtime.json', JSON.stringify(worldRuntime, null, 4))
}

module.exports = { compile }