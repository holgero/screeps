var roleRoom = require('role.room');
var roleTower = require('role.tower');
var roleHarvester = require('role.harvester');
var roleHarvester2 = require('role.harvester2');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleLorry = require('role.lorry');

module.exports.loop = function () {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    for (var roomName in Game.rooms) {
        var room = Game.rooms[roomName];
        var controller = room.controller;
        if (controller && controller.my) {
            if (!controller.safeMode && controller.safeModeAvailable && Game.map.getRoomStatus(room.name) && Game.map.getRoomStatus(room.name).status != 'novice') {
                if (room.find(FIND_HOSTILE_CREEPS).length > 0) {
                    var err=controller.activateSafeMode();
                    console.log('Activated safemode: ' + err);
                }
            }
            roleRoom.run(room, controller);
            roleTower.run(room);
        }
    }
    
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.spawning) {
            continue;
        }
        for (var role of [roleHarvester, roleHarvester2, roleUpgrader, roleBuilder, roleLorry]) {
            if (creep.memory.role == role.info.roleName) {
                role.run(creep);
            }
        }
    }
}
