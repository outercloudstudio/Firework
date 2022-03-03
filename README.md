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

# How To Use
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

# Known Limitations
## Float Support
At the moment firework does not have float support, however that is to change.
## String Support
Due to the limitations of addons string might be difficult and computationally expensive so experiments will be done with this but it is not garunteed to be added.
## Delayed IFs
Due to the limitations of addons if statements will use the state from the previous tick. In order to get around this you need to delay the if by 1:
```
delay(1) => {
    if($foo) => {
        $bar = true
    }
}
```

# Roadmap
```
✔️ = Complete
⚠️ = Inprogress
💡 = For future
```

- Constants ✔️
- Tags ✔️
- Functions ✔️
- Start and Update Functions ✔️
- If Statements ✔️
- Delays ✔️
- Molang In Expressions ✔️
- Random Booleans ✔️
- Reliable Update ✔️
- Force Update Flags 🛑
- While Loops 💡
- For Loops 💡
- Integer Flag Support 💡
- Mixin Inheritence 💡
- Cache System 💡
- Scoreboard Interaction 💡
- Flag Name Inference 💡
- Float Support 💡
- Util commands like: 💡
```
move(1, 0, 0)
die()
destroy()
log("Hello")
cdelay(1, true) => {
    log("Hello")
}
```
- Component adding and Removing