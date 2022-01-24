# How It Works:

## Folder Structure:
    world.frw
    entities
    |__ entity1.frw
    |__ entity2.frw

## Types:
    - Identifier
    - Position
    - Command
    - Entity

    Compiled In:
    - Static Integer
    - Static Float
    - Static String
    - Static Boolean

    - Dyncamic Integer => tags frw_runtime_varName_[-255 - 255]
    - Dyncamic Float => tags frw_runtime_varName_[-255.0 - 255.0 in steps of 0.1]
    - Dyncamic Boolean => tags frw_runtime_varName_[true, false]

## Runtime Flow:

# FRW to Addon:

## Print("Hello World!")
    event => {
        run_command => [
            "say Hello World!"
        ]
    }

## Print(foo) (foo = 2)
    event => {
        run_command => [
            "say 3"
        ]
    }

## Print(foo) (foo = Dynamic Integer)
    event => {
        sequence => [
            {
                condition => "foo = 0"

                run_command => [
                    "say 0"
                ]
            }
            {
                condition => "foo = 1"

                run_command => [
                    "say 1"
                ]
            }
            ...
        ],
    }