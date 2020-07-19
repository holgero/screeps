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
            if (creep.pos.inRangeTo(controller.pos, 3)) {
                var flags = _.filter(room.lookForAt(LOOK_FLAGS, creep.pos), function(flag) { return flag.name.startsWith('no parking'); });
                if (flags.length > 0) {
                    // console.log(JSON.stringify(flags));
                } else {
                    var err = creep.upgradeController(controller);
                    if (err != OK) {
                       console.log('Upgrade controller failed: ' + err);
                    }
                    return;
                }
            }
            creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
        } else {
            commons.fetchEnergy(creep);
        }
	}
};

module.exports = roleUpgrader;