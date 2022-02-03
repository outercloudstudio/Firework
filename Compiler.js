const util = require('util')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const Backend = require('./Backend')

function compile(tree){
    //console.log(util.inspect(tree, false, null, true /* enable colors */))

    fs.copyFileSync('./data/world_runtime_template.json', './output/world_runtime.json')

    if(fs.existsSync('./output')){
        fs.rmSync('./output', { recursive: true })
    }

    fs.mkdirSync('./output')
    fs.mkdirSync('./output/animations')

    let worldRuntime = JSON.parse(fs.readFileSync('./output/world_runtime.json').toString())

    let blocks = {}

    let dynamicVariables = {}

    let dynamicValues = {}

    let constants = {}

    let flags = []

    function expressionToMolang(expression){
        let result = ''

        if(expression.token == 'INTEGER' || expression.token == 'BOOLEAN'){
            result = expression.value
        }else if(expression.token == 'MOLANG'){
            result = '(' + expression.value + ')'
        }else if(expression.token == 'EXPRESSION'){
            if(expression.value[0].value == '!'){
                const deep = expressionToMolang(expression.value[1]) + ' == 0'

                if(deep instanceof Backend.Error){
                    return deep
                }

                result = '(' + deep + ')'
            }else{
                const deep = expressionToMolang(expression.value[1]) + ' ' + expression.value[0].value + ' ' + expressionToMolang(expression.value[2])

                if(deep instanceof Backend.Error){
                    return deep
                }

                result = '(' + deep + ')'
            }
        }else if(expression.token == 'FLAG'){
            result = `(q.actor_property('frw:${expression.value}'))`
        }else if(expression.token == 'CALL'){
            if(expression.value[0].value == 'rand'){
                result = `(math.die_roll(1, 0, 1) > 0.45)`
            }else{
                return new Backend.Error(`Method '${expression.value[0].value}' is not supported in an expression!`)
            }
        }else{
            return new Backend.Error('Unknown expression token: ' + expression.token + '!')
        }

        return result
    }

    function optimizeExpression(expression){
        let dynamic = false

        if(expression.token == 'SYMBOL' && (expression.value[0].value == '+' || expression.value[0].value == '-' || expression.value == '*'[0].value || expression.value == '/'[0].value || expression.value[0].value == '&&' || expression.value[0].value == '||' || expression.value[0].value == '==' || expression.value[0].value == '>' || expression.value[0].value == '<' || expression.value[0].value == '>=' || expression.value[0].value == '<=')){
            if(expression.value[1].token == 'EXPRESSION'){
                const deep = optimizeExpression(expression.value[1])

                if(deep instanceof Backend.Error){
                    return deep
                }

                expression.value[1] = deep
            }

            if(expression.value[2].token == 'EXPRESSION'){
                const deep = optimizeExpression(expression.value[2])

                if(deep instanceof Backend.Error){
                    return deep
                }

                expression.value[2] = deep
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
                const deep = optimizeExpression(expression.value[1])

                if(deep instanceof Backend.Error){
                    return deep
                }

                expression.value[1] = deep
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
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                }

                expression = { value: (parseInt(expression.value[1].value) + parseInt(expression.value[2].value)).toString(), token: 'INTEGER' }
            }else if(expression.value[0].value == '-'){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                }

                expression = { value: (parseInt(expression.value[1].value) - parseInt(expression.value[2].value)).toString(), token: 'INTEGER' }
            }else if(expression.value[0].value == '*'){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                }

                expression = { value: (parseInt(expression.value[1].value) * parseInt(expression.value[2].value)).toString(), token: 'INTEGER' }
            }else if(expression.value[0].value == '+'){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                }

                expression = { value: (parseInt(expression.value[1].value) / parseInt(expression.value[2].value)).toString(), token: 'FLOAT' }
            }else if(expression.value[0].value == '>'){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                }

                expression = { value: (parseInt(expression.value[1].value) > parseInt(expression.value[2].value)).toString(), token: 'BOOLEAN' }
            }else if(expression.value[0].value == '<'){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                }

                expression = { value: (parseInt(expression.value[1].value) < parseInt(expression.value[2].value)).toString(), token: 'BOOLEAN' }
            }else if(expression.value[0].value == '>='){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                }

                expression = { value: (parseInt(expression.value[1].value) >= parseInt(expression.value[2].value)).toString(), token: 'BOOLEAN' }
            }else if(expression.value[0].value == '<='){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                }

                expression = { value: (parseInt(expression.value[1].value) <= parseInt(expression.value[2].value)).toString(), token: 'BOOLEAN' }
            }else if(expression.value[0].value == '&&'){
                if(!(expression.value[1].token == 'BOOLEAN' && expression.value[2].token == 'BOOLEAN')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                }

                expression = { value: (expression.value[1].value == 'true' && expression.value[2].value == 'true').toString(), token: 'BOOLEAN' }
            }else if(expression.value[0].value == '||'){
                if(!(expression.value[1].token == 'BOOLEAN' && expression.value[2].token == 'BOOLEAN')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                }

                expression = { value: (expression.value[1].value == 'true' || expression.value[2].value == 'true').toString(), token: 'BOOLEAN' }
            }else if(expression.value[0].value == '!'){
                if(!(expression.value[1].token == 'BOOLEAN')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} on type ${expression.value[1].token}!`)
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
            const deep = searchForExpression(tree.value[1].value)
            
            if(deep instanceof Backend.Error){
                return deep
            }

            tree.value[1].value = deep
        }else if(tree.token == 'ASSIGN' && tree.value[0].value == 'const'){
            if(tree.value[2].token == 'EXPRESSION'){
                const deep = optimizeExpression(tree.value[2])

                if(deep instanceof Backend.Error){
                    return deep
                }

                tree.value[2] = deep
            }
        }else if(tree.token == 'CALL'){
            for(let i = 1; i < tree.value.length; i++){
                if(tree.value[i].token == 'EXPRESSION'){
                    const deep = optimizeExpression(tree.value[i])

                    if(deep instanceof Backend.Error){
                        return deep
                    }

                    tree.value[i] = deep
                }
            }
        }

        return tree
    }

    function indexCodeBlock(block, mode, condition = null, preferedID = null){
        for(let i = 0; i < block.value.length; i++){
            const deep = searchForCodeBlock(block.value[i])

            if(deep instanceof Backend.Error){
                return deep
            }

            block.value[i] = deep
        }

        let ID = uuidv4()

        if(preferedID != null && !blocks[preferedID]){
            ID = preferedID
        }

        if(mode == 'conditional'){
            const deep = expressionToMolang(condition)

            if(deep instanceof Backend.Error){
                return deep
            }

            dynamicValues[ID] = {
                condition: deep
            }
        }

        blocks[ID] = block.value

        block = { value: [ID, mode], token: 'BLOCKREF'}

        return block
    }

    function indexConstant(token){
        if(token.value[2].token == 'EXPRESSION' || token.value[2].dynamic){
            return new Backend.Error(`Can not assign dyncamic value to const ${token.value[1].value}!`)
        }

        if(constants[token.value[1].value]){
            return new Backend.Error(`Can not initialize constant ${token.value[1].value} more than once!`)
        }

        constants[token.value[1].value] = token.value[2]
    }

    function searchForCodeBlock(tree){
        if(tree.token == 'DEFINITION'){
            const deep = indexCodeBlock(tree.value[1], 'normal', null, tree.value[0].value)

            if(deep instanceof Backend.Error){
                return deep
            }

            tree.value[1] = deep
        }else if(tree.token == 'IF'){
            const deep = indexCodeBlock(tree.value[1], 'conditional', tree.value[0])

            if(deep instanceof Backend.Error){
                return deep
            }

            tree.value[1] = deep
        }else if(tree.token == 'DELAY'){
            const deep = indexCodeBlock(tree.value[1], 'delay')

            if(deep instanceof Backend.Error){
                return deep
            }

            tree.value[1] = deep
        }

        return tree
    }

    function indexFlag(flag){
        if(!flags.includes(flag.value)){
            flags.push(flag.value)
        }
    }

    function searchForFlags(tree){
        if(tree.token == 'DEFINITION' || tree.token == 'IF' || tree.token == 'DELAY'){

            if(tree.value[0].token == 'EXPRESSION'){
                const deep = searchForFlags(tree.value[0])

                if(deep instanceof Backend.Error){
                    return deep
                }

                tree.value[0] = deep
            }else if(tree.value[0].token == 'FLAG'){
                indexFlag(tree.value[0])
            }

            for(let i = 0; i < tree.value[1].value.length; i++){
                const deep = searchForFlags(tree.value[1].value[i])

                if(deep instanceof Backend.Error){
                    return deep
                }

                tree.value[1].value[i] = deep
            }
        }else if(tree.token == 'ASSIGN' && tree.value[0].token == 'FLAG'){
            indexFlag(tree.value[0])
        }

        return tree
    }

    for(let i = 0; i < tree.length; i++){
        const deep = searchForExpression(tree[i])

        if(deep instanceof Backend.Error){
            return deep
        }

        tree[i] = deep
    }

    for(let i = 0; i < tree.length; i++){
        if(tree[i].token == 'ASSIGN'){
            if(tree[i].value[0].value == 'const'){
                const deep = indexConstant(tree[i])

                if(deep instanceof Backend.Error){
                    return deep
                }
            }
        }
    }

    for(let i = 0; i < tree.length; i++){
        const deep = searchForCodeBlock(tree[i])

        if(deep instanceof Backend.Error){
            return deep
        }

        tree[i] = deep
    }

    for(let i = 0; i < tree.length; i++){
        const deep = searchForFlags(tree[i])

        if(deep instanceof Backend.Error){
            return deep
        }

        tree[i] = deep
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

        fs.writeFileSync('./output/animations/frw_' + dynamicValueNames[i] + '.json', JSON.stringify(animCont, null, 4))

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

        fs.writeFileSync('./output/animations/frw_' + dynamicValueNames[i] + '_inverse.json', JSON.stringify(animCont, null, 4))

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

    fs.writeFileSync('./output/animations/frw_' + updateID + '_update.json', JSON.stringify(updateData, null, 4))

    worldRuntime['minecraft:entity'].description.animations['frw_update'] = 'animation.firework.runtime.' + updateID + '.update'

    fs.writeFileSync('./output/world_runtime.json', JSON.stringify(worldRuntime, null, 4))
}

module.exports = { compile }