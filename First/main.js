var roleHarvester = require('role.harvester');
var roleHarvester2 = require('role.harvester2');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleTower = require('role.tower');
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
        if (strategySpawn.createMissing('upgrader', 3)) {
            var spawn = Game.spawns['Spawn1'];
            strategDevelop.developRoads(spawn);
            strategySpawn.createMissing('builder', 1);
            if (strategDevelop.developRoom(2, STRUCTURE_EXTENSION, spawn.room.getPositionAt(spawn.pos.x, spawn.pos.y + 2), 5)) {
                if (strategySpawn.createMissing('builder', 3)) {
                    strategySpawn.createMissing('upgrader', 5);
                    if (strategDevelop.developRoom(3, STRUCTURE_TOWER, spawn.room.getPositionAt(spawn.pos.x, spawn.pos.y + 4), 1)) {
                        strategySpawn.createMissing('harvester', 3);
                    }
                }
            }
        }
    }

    roleTower.run(Game.spawns['Spawn1'].room);

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'harvester2') {
            roleHarvester2.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
}
