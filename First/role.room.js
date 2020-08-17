var roleSpawn = require('role.spawn');
var strategySpawn = require('strategy.autospawn');
var strategyDevelop = require('strategy.development');
var roleHarvester = require('role.harvester');
var roleLorry = require('role.lorry');
var roleHarvester2 = require('role.harvester2');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleExplorer = require('role.explorer');
var roleSoldier = require('role.soldier');
var roleMedic = require('role.medic');

var roleRoom = {
    calculateNeededCreeps: function(room, controller) {
        var needed = {
            harvester: 0,
            harvester2: 0,
            upgrader: 0,
            builder: 0,
            lorry: 0,
            explorer: 0,
            soldier: 0,
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
                needed.upgrader = 4;
                needed.builder = 3;
                break;
            case 3:
                needed.harvester = 3;
                needed.upgrader = 5;
                needed.builder = 3;
                break;
            case 4:
                needed.harvester = 3;
                needed.upgrader = 6;
                needed.builder = 3;
                break;
            case 5:
            default:
                needed.harvester = 3;
                needed.upgrader = 7;
                needed.builder = 3;
                break;
        }
        var containers = room.find(FIND_STRUCTURES, { filter: {structureType: STRUCTURE_CONTAINER}});
        needed.harvester2 = containers.length;
        needed.lorry = containers.length;
        needed.harvester = Math.max(0, needed.harvester - needed.lorry);
        var construction_sites = room.find(FIND_MY_CONSTRUCTION_SITES);
        if (construction_sites.length == 0) {
            needed.builder = 0;
        } else {
	    needed.upgrader -= needed.builder;
	    var containerEnergy = 0;
	    var containerEnergyCapacity = 0;
	    containers.forEach(function (c) {
	       containerEnergy += c.store.getUsedCapacity(RESOURCE_ENERGY);
	       containerEnergyCapacity += c.store.getCapacity(RESOURCE_ENERGY);
	    });
	    if (containerEnergy > containerEnergyCapacity/2) {
	        needed.lorry ++;
	    }
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
        if (room.find(FIND_HOSTILE_CREEPS).length > 0) {
            strategySpawn.createMissing(spawn, roleSoldier.info, 3);
            strategySpawn.createMissing(spawn, roleMedic.info, 2);
            roleSpawn.run(spawn);
            return;
        }
        if (room.memory.needed === undefined || room.memory.existing === undefined || Game.time % 100 == 0) {
            roleRoom.calculateNeededCreeps(room, controller);
            roleRoom.calculateExistingCreeps(room);
        }
        if (Game.time % 10 == 0) {
            if (strategySpawn.createMissing(spawn, roleHarvester.info, room.memory.needed.harvester) &&
            strategySpawn.createMissing(spawn, roleHarvester2.info, room.memory.needed.harvester2) &&
            strategySpawn.createMissing(spawn, roleLorry.info, room.memory.needed.lorry) &&
            strategySpawn.createMissing(spawn, roleExplorer.info, room.memory.needed.explorer) &&
            strategySpawn.createMissing(spawn, roleUpgrader.info, room.memory.needed.upgrader) &&
            strategySpawn.createMissing(spawn, roleBuilder.info, room.memory.needed.builder)) {
                strategyDevelop.developSwampRoads(room);
                strategyDevelop.developContainers(room);
                if (strategyDevelop.developRoom(room, 2, STRUCTURE_EXTENSION, room.getPositionAt(spawn.pos.x - 2, spawn.pos.y + 2), 5)) {
                    strategyDevelop.developRoads(room);
                }
                if (strategyDevelop.developRoom(room, 3, STRUCTURE_TOWER, room.getPositionAt(spawn.pos.x, spawn.pos.y + 4), 1)) {
                    strategyDevelop.developRoom(room, 3, STRUCTURE_EXTENSION, room.getPositionAt(spawn.pos.x-2, spawn.pos.y + 3), 10);
                }
                if (strategyDevelop.developRoom(room, 4, STRUCTURE_STORAGE, room.getPositionAt(spawn.pos.x, spawn.pos.y + 6), 1)) {
                    if (strategyDevelop.developRoom(room, 4, STRUCTURE_EXTENSION, room.getPositionAt(spawn.pos.x-2, spawn.pos.y + 7), 15)) {
                        strategyDevelop.developRoom(room, 4, STRUCTURE_EXTENSION, room.getPositionAt(spawn.pos.x-2, spawn.pos.y + 8), 20);
                    }
                }
                if (strategyDevelop.developRoom(room, 5, STRUCTURE_TOWER, room.getPositionAt(spawn.pos.x - 4, spawn.pos.y), 2)) {
                    // something else on level 5?
                }
            }
        }
    
        roleSpawn.run(spawn);
    }
};

module.exports = roleRoom;
