var roleHarvester = require('role.harvester');
var roleHarvester2 = require('role.harvester2');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleTower = require('role.tower');
var roleSpawn = require('role.spawn');
var strategySpawn = require('strategy.autospawn');
var strategyDevelop = require('strategy.development');

module.exports.loop = function () {
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    var spawn = Game.spawns['Spawn1'];
    if (strategySpawn.createMissing(roleHarvester.info, 1)) {
        if (strategySpawn.createMissing(roleUpgrader.info, 3)) {
            strategyDevelop.developSwampRoads(spawn);
            strategyDevelop.developContainers(spawn);
            strategySpawn.createMissing(roleBuilder.info, 1);
            strategySpawn.createContainerHarvesters(roleHarvester2.info);
        }
    }
    if (strategyDevelop.developRoom(2, STRUCTURE_EXTENSION, spawn.room.getPositionAt(spawn.pos.x, spawn.pos.y + 2), 5)) {
        if (strategySpawn.createMissing(roleBuilder.info, 3)) {
            strategySpawn.createMissing(roleHarvester.info, 2);
            strategyDevelop.developRoads(spawn);
            strategySpawn.createMissing(roleUpgrader.info, 5);
        }
    }
    if (strategyDevelop.developRoom(3, STRUCTURE_TOWER, spawn.room.getPositionAt(spawn.pos.x, spawn.pos.y + 4), 1)) {
        if (strategySpawn.createMissing(roleHarvester.info, 3)) {
            strategyDevelop.developRoom(3, STRUCTURE_EXTENSION, spawn.room.getPositionAt(spawn.pos.x-2, spawn.pos.y + 6), 10);
        }
    }
    if (strategyDevelop.developRoom(4, STRUCTURE_STORAGE, spawn.room.getPositionAt(spawn.pos.x, spawn.pos.y + 6), 1)) {
        // more on level 4?
    }

    roleSpawn.run(spawn);
    roleTower.run(spawn.room);

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
