# First implementation

## Description

This implementation stems mostly from the tutorial. Creeps have roles assigned when they are spawned and try to fulfill that roles during their life time.

### Main (main.js)

The main loop does memory clean up, then iterates over the rooms to initiate safe mode where attacks occur, run the room's development and to run the towers there.
Then it iterates over all creeps and lets them run their individual roles.

### Rooms (role.room.js)

Room development depends on controller level, it places new structures automatically near the spawn when certain controller levels are reached. Also the needed number of creeps is calculated depending on controller level. When the room is under attack, different creeps are spawned.

### Towers (role.tower.js)

Towers attack hostile creeps and repair damaged structures. Repairing is done only half of the time, to allow feeding creeps to fill up energy for other structures. Depending on the available energy of the towers, structures with the lowest hit count are repaired first.

### Spawn (role.spawn.js)

The spawn renews nearby creeps that have low ticksToLive and recycles builder creeps when they are not needed.

### Creeps

Common functions for creeps are located in a separate module (creep.commons.js).

#### Builder (role.builder.js)

Builder creeps build structures on existing construction sites. First construction site they found is built.

#### Explorer (role.explorer.js)

Explorer creeps can claim an controller in another room. They are manually guided by flags with a name that starts with 'Explore'.

#### Harvester2 (role.harvester2.js)

Harvester2 creeps have no CARRY body part, but multiple WORK body parts. They do container mining.

#### Harvester (role.harvester.js)

Harvester creeps do mining and feed the mined energy to structures that need it. Used during start of the game and as a back up when things go wrong.

#### Lorry (role.lorry.js)

Transports energy from containers to central structures.

#### Medic and Soldier (role.medic.js, role.soldier.js)

Spawned when the room is under attack. Soldiers attack hostile creeps until their hit count goes critically low, then they try to run away. Medics heal soldiers.

#### Upgrader (role.upgrader.js)

Upgraders fetch energy and upgrade the room controller.

### Helpers

The module strategy.autospawn.js contains a method to spawn creeps up to a given number.
The module strategy.development.js has methods to devolp structures in a room.

