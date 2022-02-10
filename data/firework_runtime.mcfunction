event entity @e[tag=started3] frw:update
event entity @e[tag=started3] frwb:delay
event entity @e[tag=started2, tag=!started3] frw:start
tag @e[tag=started2] add started3
tag @e[tag=started] add started2
tag @e add started