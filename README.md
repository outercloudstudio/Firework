# How to Use
## Install
1. Clone this repository onto your local machine.
2. Make sure you have node installed.
3. Run these commands:
```
npm install util
npm install chalk
npm install inquirer
npm install nanospinner
```
4. Run `npm start`

## Setup Project
1. Enter the path to your bridge. v2 project
2. Choose setup

## Compile
1. Enter the path to your bridge. v2 project
2. Choose compile
3. DON'T CLOSE THE TERMINAL
4. To compile again just restart the dev the server using bridge. v2

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
```