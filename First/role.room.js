var roleSpawn = require('role.spawn');
var strategySpawn = require('strategy.autospawn');
var strategyDevelop = require('strategy.development');
var roleHarvester = require('role.harvester');
var roleHarvester2 = require('role.harvester2');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

var roleRoom = {
    calculateNeededCreeps: function(room, controller) {
        var needed = {
            harvester: 0,
            harvester2: 0,
            upgrader: 0,
            builder: 0,
        };
        switch (controller.level) {
            case 0:
            case 1:
                needed.harvester = 1;
                needed.upgrader = 3;
                needed.builder = 1;
                break;
            case 2:
                needed.harvester = 2;
                needed.upgrader = 5;
                needed.builder = 3;
                break;
            case 3:
            default:
                needed.harvester = 3;
                needed.upgrader = 5;
                needed.builder = 3;
                break;
        }
        var containers = room.find(FIND_STRUCTURES, { filter: {structureType: STRUCTURE_CONTAINER}});
        needed.harvester2 = containers.length;
        var construction_sites = room.find(FIND_MY_CONSTRUCTION_SITES);
        if (construction_sites.length == 0) {
            needed.builder = 0;
        }
        room.memory.needed = needed;
    },
    run: function(room, controller) {
        const spawns = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } });
        if (!spawns) {
            return;
        }
        const spawn = spawns[0];
        
        if (room.memory.needed === undefined || Game.time % 100 == 0) {
            roleRoom.calculateNeededCreeps(room, controller);
        }
        if (Game.time % 10 == 0) {
            if (strategySpawn.createMissing(roleHarvester.info, room.memory.needed.harvester) &&
            strategySpawn.createMissing(roleHarvester2.info, room.memory.needed.harvester2) &&
            strategySpawn.createMissing(roleUpgrader.info, room.memory.needed.upgrader) &&
            strategySpawn.createMissing(roleBuilder.info, room.memory.needed.builder)) {
                strategyDevelop.developSwampRoads(spawn);
                strategyDevelop.developContainers(spawn);
            }
            if (strategyDevelop.developRoom(2, STRUCTURE_EXTENSION, room.getPositionAt(spawn.pos.x, spawn.pos.y + 2), 5)) {
                strategyDevelop.developRoads(spawn);
            }
            if (strategyDevelop.developRoom(3, STRUCTURE_TOWER, room.getPositionAt(spawn.pos.x, spawn.pos.y + 4), 1)) {
                strategyDevelop.developRoom(3, STRUCTURE_EXTENSION, room.getPositionAt(spawn.pos.x-2, spawn.pos.y + 6), 10);
            }
            if (strategyDevelop.developRoom(4, STRUCTURE_STORAGE, room.getPositionAt(spawn.pos.x, spawn.pos.y + 6), 1)) {
                // more on level 4?
            }
        }
    
        roleSpawn.run(spawn);
    }
};

module.exports = roleRoom;
