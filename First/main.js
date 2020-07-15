var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var strategySpawn = require('strategy.autospawn');

module.exports.loop = function () {
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    if (strategySpawn.createMissing('harvester', 1)) {
        if (strategySpawn.createMissing('upgrader', 1)) {
            if (strategySpawn.createMissing('builder', 1)) {
                var spawn = Game.spawns['Spawn1'];
                var towers = spawn.room.find(FIND_MY_STRUCTURES, { filter: {structureType: STRUCTURE_TOWER}});
                if (towers.length < 1) {
                    var err = spawn.room.createConstructionSite(24, 30, STRUCTURE_TOWER);
                    console.log('createConstructionSite: ' + err);
                } else {
                    //console.log('Have a tower: ' + towers[0]);
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