# How to Use
## Install
1. Get the extension from the bridge. v2 extension library
2. Add 'firework' to the very end of the compiler config:
```
"compiler": {
    "plugins": [
        "typeScript",
        "entityIdentifierAlias",
        "customEntityComponents",
        "customItemComponents",
        "customBlockComponents",
        "customCommands",
        "moLang",
        [
            "simpleRewrite",
            {
                "packName": "FireLabs"
            }
        ],
        "firework"
    ]
}
```

## Setup Project
1. Create a `firework` folder in you behaviour pack
2. Create a script with a name ending in .frw
3. In an entity add the component `"frw:script_name": {}`

# Features
## Functions
Create functions for reusing code around the script.
```
func hello => {
    rc("say hello world")
}
```
Firework comes with 2 native functions you can use:
1. Start
2. Update

Start is called once when the enity is spawned and update is called every tick.
## IF Statements
Use molang and flags and expression to create dynamic conditions.
```
func start => {
    if(?"q.position(1) < 64") => {
        rc("say below sea level!")
    }
}
```
## Delays
Use delays to create pauses or a wait for 1 tick. This can also be used to loop.
```
func start => {
    delay(10) => {
        rc("say 3")

        delay(10) => {
            rc("say 2")

            delay(10) => {
                rc("say 1")
            }
        }
    }
}
```
## Constants
Create constants for later use in the script.
```
const foo = false
```
## Flags
Use flags to store a dynamic boolean value.
```
func start => {
    $foo = false

    if($foo) => {
        rc("say bar!")
    }
}
```
## Dynamic Flags
Create dynamic flags to make a flag update every tick with a molang value.
```
dyn foo = ?"q.position(0) > 100"
```

## Addon to Addons
Firework will automatically addon to your existing projects and enitities!

# Examples
## Basic Script
This script runns every tick and places a block at the entities position.
```
func update => {
    rc("setblock ~ ~ ~ deepslate_diamond_ore")
}
```
## Random Block
This script sets diamonds to a random true or false value. Then, if the diamonds flag is true then place diamond ore, else place iron ore.
```
func update => {
    $diamonds = false

    if(rand()) => {
        $diamonds = true
    }

    if($diamonds) => {
        rc("setblock ~ ~ ~ deepslate_diamond_ore")
    }

    if(!$diamonds) => {
        rc("setblock ~ ~ ~ deepslate_iron_ore")
    }
}
```

# Syntax
__**If**__
Only runs code if condition is true. Internally adds a slight delay to keep logic reliable.
```
if(expression) => {

}
```
__**Fif**__
If statement but is less reliable due to not adding a slight delay.
```
fif(expression) => {

}
```
__**Else**__
Runs if the above if or fif is false.
```
if(expression) => {

}else => {

}
```
__**Delay**__
Delays code for x ticks.
```
delay(x) => {

}
```
__**Flag**__
Allows you to create a variable that stores a boolean or weak boolean.
`$foo = false`
__**Dynamic Flags**__
Allows you to resuse molang in expression.
`dyn bar = ?"q.position(0) > 32"`
__**Native Functions**__
•*rc*
    Runs the given command in a string
•*move*
    Moves the value in the string
•*say*
    Says the value in the string
•*rand*
   Used in molang; No paramaters = 50% chance; 1 Paramater = 1/Paramater chance
•*die*
   Kills entity
__**Functions**__
Define functions for reusing code. Define `start` or `update` which are build in. *Start always executes before update.* Function names may not include any symbols (except '_'), spaces, or numbers. Please not that certain symbols will now throw an error like '@' when used in a function name but is not a good practice. Names must also be less than 30 characters!
```
func foo => {

}
```

# Advanced Concepts
__**How To Interact With Firework From Outside Of It**__
•*Set a flag*
   `event entity @s frw_flagName_true` or  `frw_flagName_false`
•*Call a function*
   `event entity @s frw_functionName`
•*Check for a flag*
   Flags are just tags with the name frw_flagName
   
__**Per Script Configs**__
This feature allows you to customize and reuse the same script across multiple entities.
*In the entity:*
```
"frw:testScript": {
  "speed": "~1 ~ ~"
}
```
*In script:*
```
func update => {
  move(speed)
}
```
This feature supports booleans, strings, and integers.

**__Weak Types__**
Weak types are types that are essentially another but have somewhat different functionality. For example, molang is the same as a boolean but dynamic instead of static. This means you can add molang to anything that excepts a boolean. This allows you to do things like this:
```
 $foo = ?"q.position(1) > 0"
```

**__Vars__**
Variables can store an integer from -1024 to 1024. Similar to flags the are referenced like this `#foo` and can be assigned to any weak integer this means you can even set them the an expression that contains itself to do operations on the value.

`#foo = foo + 1 `
