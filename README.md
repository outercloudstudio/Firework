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
## Constants ✔️
## Tags ✔️
- Reading ✔️
- Setting ✔️
## Functions ✔️
- Defining ✔️
- Calling ✔️
## Start and Update Functions ✔️
## If Statements ✔️
## Delays ⚠️
    Done by setting a tag that then gets count down every 0.1 secs in an animation and
    then removes the tag when it reaches 0 and calls the final code block.
## Molang In Expressions ✔️
## Random Booleans ✔️
    Done by reading a flag that is updated every tick by a random function.
## While Loops ➡️
    Done by continously calling the code block until the condition is false.
## For Loops ➡️
    Done by counting down a variable like delay but without waiting.