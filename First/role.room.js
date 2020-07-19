var roleSpawn = require('role.spawn');
var strategySpawn = require('strategy.autospawn');
var strategyDevelop = require('strategy.development');
var roleHarvester = require('role.harvester');
var roleHarvester2 = require('role.harvester2');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

var roleRoom = {
    run: function(room, controller) {
        const spawns = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } });
        if (!spawns) {
            return;
        }
        const spawn = spawns[0];
        // console.log(JSON.stringify(spawn));
        if (strategySpawn.createMissing(roleHarvester.info, 1)) {
            if (strategySpawn.createMissing(roleUpgrader.info, 3)) {
                strategyDevelop.developSwampRoads(spawn);
                strategyDevelop.developContainers(spawn);
                strategySpawn.createMissing(roleBuilder.info, 1);
                strategySpawn.createContainerHarvesters(roleHarvester2.info);
            }
        }
        if (strategyDevelop.developRoom(2, STRUCTURE_EXTENSION, room.getPositionAt(spawn.pos.x, spawn.pos.y + 2), 5)) {
            if (strategySpawn.createMissing(roleBuilder.info, 3)) {
                strategySpawn.createMissing(roleHarvester.info, 2);
                strategyDevelop.developRoads(spawn);
                strategySpawn.createMissing(roleUpgrader.info, 5);
            }
        }
        if (strategyDevelop.developRoom(3, STRUCTURE_TOWER, room.getPositionAt(spawn.pos.x, spawn.pos.y + 4), 1)) {
            if (strategySpawn.createMissing(roleHarvester.info, 3)) {
                strategyDevelop.developRoom(3, STRUCTURE_EXTENSION, room.getPositionAt(spawn.pos.x-2, spawn.pos.y + 6), 10);
            }
        }
        if (strategyDevelop.developRoom(4, STRUCTURE_STORAGE, room.getPositionAt(spawn.pos.x, spawn.pos.y + 6), 1)) {
            // more on level 4?
        }
    
        roleSpawn.run(spawn);
    }
};

module.exports = roleRoom;
