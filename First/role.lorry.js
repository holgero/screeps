var commons = require('creep.commons');

var roleLorry = {
    info: {
        roleName: 'lorry',
        minimalBody: [CARRY, MOVE],
        increaseCarry: true,
        increaseMove: true,
        increaseWork: false,
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        commons.releaseEnergySources(creep);

	    if (creep.memory.feeding && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.feeding = false;
            delete creep.memory.feedTarget;
            creep.say('🔄 fetch');
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
            for (var tombstone of creep.room.find(FIND_TOMBSTONES)) {
                // console.log(JSON.stringify(tombstone));
                // console.log(JSON.stringify(tombstone.store));
                for (var res in tombstone.store) {
                    console.log(creep.name + ", picking up resource: " + res);
                    if (creep.withdraw(tombstone, res) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(tombstone);
                        return;
                    }
                }
            }
            const targets = creep.room.find(FIND_DROPPED_RESOURCES);
            if (targets.length) {
                console.log(JSON.stringify(targets[0]));
                if (creep.pickup(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                    return;
                }
            }
            commons.fetchEnergy(creep, false, false);
        }
	}
};

module.exports = roleLorry;
