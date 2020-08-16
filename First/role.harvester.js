var commons = require('creep.commons');

var roleHarvester = {
    info: {
        roleName: 'harvester',
        minimalBody: [WORK, CARRY, MOVE],
        increaseCarry: true,
        increaseMove: true,
        increaseWork: false,
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

	    if (creep.memory.feeding && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.feeding = false;
            creep.say('🔄 harvest');
	    }
	    if (!creep.memory.feeding && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
	        creep.memory.feeding = true;
	        creep.say('🚧 feed');
	    }

	    if (creep.memory.feeding) {
            if (!creep.memory.feedTarget) {
                commons.findFeedTarget(creep);
            }
            if (creep.memory.feedTarget) {
                const target = Game.getObjectById(creep.memory.feedTarget);
                var err = creep.transfer(target, RESOURCE_ENERGY);
                if (err == ERR_NOT_IN_RANGE) {
                    commons.moveTo(creep, target.pos);
                } else if (err == OK || err == ERR_FULL) {
                    delete creep.memory.feedTarget;
                    delete creep.memory.movePath;
                }
            }
        } else {
            commons.fetchEnergy(creep, true, false);
        }
	}
};

module.exports = roleHarvester;
