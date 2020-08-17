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
            delete creep.memory.placeToBe;
            creep.say('🔄 harvest');
	    }
	    if (!creep.memory.upgrading && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if (creep.memory.upgrading) {
	        var room = creep.room;
	        var controller = room.controller;
            for (var ii=0; ii<3; ii++) {
                var place = creep.memory.placeToBe;
                if (!place) {
                    var sources = room.find(FIND_SOURCES);
                    place = commons.findSuitablePlace(creep, controller, sources);
                    creep.memory.placeToBe = place;
                    if (!place) {
                        console.log('failed to find a place near target ' + JSON.stringify(target));
                        return;
                    }
                }
                if (place) {
                    if (creep.pos.x == place.x && creep.pos.y == place.y) {
                        delete creep.memory.movePath;
                        var err = creep.upgradeController(controller);
                        if (err != OK) {
                           console.log('Upgrade controller failed: ' + err);
                        }
                        return;
                    } else {
                        if (creep.pos.isNearTo(place.x, place.y) && room.lookForAt(LOOK_CREEPS, place.x, place.y).length) {
                            console.log('Place to be (' + JSON.stringify(place) + ') is blocked!');
                            delete creep.memory.placeToBe;
                            delete creep.memory.movePath;
                        } else {
                            commons.moveTo(creep, room.getPositionAt(place.x, place.y));
                            return;
                        }
                    }
                }
            }
            console.log('Loop failed');
        } else {
            commons.fetchEnergy(creep);
        }
	}
};

module.exports = roleUpgrader;