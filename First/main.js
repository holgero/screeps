var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var strategySpawn = require('strategy.autospawn');
var strategDevelop = require('strategy.development');

module.exports.loop = function () {
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    if (strategySpawn.createMissing('harvester', 1)) {
        if (strategySpawn.createMissing('upgrader', 1)) {
            var spawn = Game.spawns['Spawn1'];
            if (strategDevelop.developRoom(2, STRUCTURE_EXTENSION, spawn.room.getPositionAt(spawn.pos.x, spawn.pos.y + 5))) {
                if (strategySpawn.createMissing('builder', 1)) {
                    if (strategDevelop.developRoom(3, STRUCTURE_TOWER, spawn.room.getPositionAt(spawn.pos.x, spawn.pos.y + 10))) {
                        var towers = spawn.room.find(FIND_MY_STRUCTURES, { filter: {structureType: STRUCTURE_TOWER}});
                        if (towers.length > 0) {
                            var closestDamagedStructure = towers[0].pos.findClosestByRange(FIND_STRUCTURES, {
                                filter: (structure) => structure.hits < structure.hitsMax });
                            if(closestDamagedStructure) {
                                towers[0].repair(closestDamagedStructure);
                            }
                            var closestHostile = towers[0].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                            if (closestHostile) {
                                towers[0].attack(closestHostile);
                            }
                            strategySpawn.createMissing('harvester', 2);
                        }
                    }
                }
            }
        }
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
}
