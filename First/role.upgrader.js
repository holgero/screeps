var commons = require('creep.commons');

var roleUpgrader = {
    info: {
        roleName: 'upgrader',
        minimalBody: [WORK, CARRY, MOVE],
        increaseCarry: true,
        increaseMove: true,
        increaseWork: true,
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        commons.releaseEnergySources(creep);
        if (creep.memory.developmentaid) {
            var position = new RoomPosition(creep.memory.developmentaid.x, creep.memory.developmentaid.y, creep.memory.developmentaid.roomName);
            if (0 == commons.moveTo(creep, position)) {
                delete creep.memory.developmentaid;
            }
            return;
        }

        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
	    }
	    if (!creep.memory.upgrading && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if (creep.memory.upgrading) {
	        var room = creep.room;
	        var controller = room.controller;
            if (creep.pos.inRangeTo(controller.pos, 4)) {
                var sources = room.find(FIND_SOURCES);
                if (creep.pos.inRangeTo(controller.pos, 3)) {
                    if (commons.noParking(room, sources, creep.pos)) {
                        var place = commons.findSuitablePlace(creep, controller, sources);
                        if (place != null) {
                            if (commons.moveTo(creep, place) != 0) {
                                return;
                            }
                            console.log("Strange, cannot park here, but findSuitablePlace points to here???");
                            return;
                        }
                    } else {
                        delete creep.memory.movePath;
                        var err = creep.upgradeController(controller);
                        if (err != OK) {
                           console.log('Upgrade controller failed: ' + err);
                        }
                        return;
                    }
                } else {
                    var place = commons.findSuitablePlace(creep, controller, sources);
                    if (place != null) {
                        commons.moveTo(creep, place);
                        return;
                    }
                }
            }
            commons.moveTo(creep, controller.pos);
        } else {
            commons.fetchEnergy(creep);
        }
	}
};

module.exports = roleUpgrader;