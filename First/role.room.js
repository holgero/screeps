var roleSpawn = require('role.spawn');
var strategySpawn = require('strategy.autospawn');
var strategyDevelop = require('strategy.development');
var roleHarvester = require('role.harvester');
var roleLorry = require('role.lorry');
var roleHarvester2 = require('role.harvester2');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleExplorer = require('role.explorer');

var roleRoom = {
    calculateNeededCreeps: function(room, controller) {
        var needed = {
            harvester: 0,
            harvester2: 0,
            upgrader: 0,
            builder: 0,
            lorry: 0,
            explorer: 0,
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
                needed.harvester = 3;
                needed.upgrader = 6;
                needed.builder = 3;
                break;
            case 4:
                needed.harvester = 3;
                needed.upgrader = 7;
                needed.builder = 3;
                needed.explorer = 1;
                break;
            case 5:
            default:
                needed.harvester = 3;
                needed.upgrader = 8;
                needed.builder = 3;
                needed.explorer = 1;
                break;
        }
        var containers = room.find(FIND_STRUCTURES, { filter: {structureType: STRUCTURE_CONTAINER}});
        needed.harvester2 = containers.length;
        needed.lorry = Math.ceil(1.1 * containers.length);
        needed.harvester = Math.max(1, needed.harvester - needed.lorry);
        var construction_sites = room.find(FIND_MY_CONSTRUCTION_SITES);
        if (construction_sites.length == 0) {
            needed.builder = 0;
        }
        room.memory.needed = needed;
    },
    calculateExistingCreeps: function(room) {
        var existing = {
            harvester: 0,
            harvester2: 0,
            upgrader: 0,
            builder: 0,
            lorry: 0,
        };
        const creeps = room.find(FIND_MY_CREEPS);
        creeps.forEach(function(creep){
           switch (creep.memory.role) {
               case roleHarvester.info.roleName: existing.harvester++; break;
               case roleLorry.info.roleName: existing.lorry++; break;
               case roleHarvester2.info.roleName: existing.harvester2++; break;
               case roleUpgrader.info.roleName: existing.upgrader++; break;
               case roleBuilder.info.roleName: existing.builder++; break;
           }
        });
        room.memory.existing = existing;
    },
    run: function(room, controller) {
        const spawns = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } });
        if (!spawns || !spawns.length) {
            return;
        }
        const spawn = spawns[0];

        if (room.memory.needed === undefined || room.memory.existing === undefined || Game.time % 100 == 0) {
            roleRoom.calculateNeededCreeps(room, controller);
            roleRoom.calculateExistingCreeps(room);
        }
        if (Game.time % 10 == 0) {
            if (strategySpawn.createMissing(roleHarvester.info, room.memory.needed.harvester) &&
            strategySpawn.createMissing(roleHarvester2.info, room.memory.needed.harvester2) &&
            strategySpawn.createMissing(roleLorry.info, room.memory.needed.lorry) &&
            strategySpawn.createMissing(roleExplorer.info, room.memory.needed.explorer) &&
            strategySpawn.createMissing(roleUpgrader.info, room.memory.needed.upgrader) &&
            strategySpawn.createMissing(roleBuilder.info, room.memory.needed.builder)) {
                strategyDevelop.developSwampRoads(spawn);
                strategyDevelop.developContainers(spawn);
                if (strategyDevelop.developRoom(2, STRUCTURE_EXTENSION, room.getPositionAt(spawn.pos.x - 2, spawn.pos.y + 2), 5)) {
                    strategyDevelop.developRoads(spawn);
                }
                if (strategyDevelop.developRoom(3, STRUCTURE_TOWER, room.getPositionAt(spawn.pos.x, spawn.pos.y + 4), 1)) {
                    strategyDevelop.developRoom(3, STRUCTURE_EXTENSION, room.getPositionAt(spawn.pos.x-2, spawn.pos.y + 3), 10);
                }
                if (strategyDevelop.developRoom(4, STRUCTURE_STORAGE, room.getPositionAt(spawn.pos.x, spawn.pos.y + 6), 1)) {
                    if (strategyDevelop.developRoom(4, STRUCTURE_EXTENSION, room.getPositionAt(spawn.pos.x-2, spawn.pos.y + 7), 15)) {
                        strategyDevelop.developRoom(4, STRUCTURE_EXTENSION, room.getPositionAt(spawn.pos.x-2, spawn.pos.y + 8), 20);
                    }
                }
                if (strategyDevelop.developRoom(5, STRUCTURE_TOWER, room.getPositionAt(spawn.pos.x - 4, spawn.pos.y), 2)) {
                    // something else on level 5?
                }
            }
        }
    
        roleSpawn.run(spawn);
    }
};

module.exports = roleRoom;
