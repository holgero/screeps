var commons = require('creep.commons');

var roleLorry = {
    info: {
        roleName: 'lorry',
        minimalBody: [CARRY, MOVE],
        increaseCarry: true,
        increaseMove: true,
        increaseWork: false,
    },

    findFeedTarget: function(creep) {
        var targets = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION
                            || structure.structureType == STRUCTURE_SPAWN
                            || structure.structureType == STRUCTURE_TOWER
                            || structure.structureType == STRUCTURE_STORAGE) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
        });
        if (!targets || !targets.length) {
            return;
        }
        if (targets.length == 1) {
            creep.memory.feedTarget = targets[0].id;
            return;
        }
        function ordinalOf(target) {
            switch (target.structureType) {
                case STRUCTURE_SPAWN: return 1;
                case STRUCTURE_TOWER:
		    if (target.store.getUsedCapacity(RESOURCE_ENERGY) < target.store.getCapacity(RESOURCE_ENERGY)/2) {
			return 2;
		    } else {
			return 4;
		    }
                case STRUCTURE_EXTENSION: return 3;
                case STRUCTURE_STORAGE: return 5;
                default: return 6;
            }
        };
        //targets.forEach(function(t) {
        //   console.log(JSON.stringify(t) + " has ordinal " + ordinalOf(t)); 
        //});
        targets.sort((a,b) => ordinalOf(a) - ordinalOf(b));
        //console.log(creep.name + ": will feed " + JSON.stringify(targets[0]));
        creep.memory.feedTarget = targets[0].id;
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
	            roleLorry.findFeedTarget(creep);
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
            }
            const targets = creep.room.find(FIND_DROPPED_RESOURCES);
            if (targets.length) {
                console.log(JSON.stringify(targets[0]));
                if (creep.pickup(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
                return;
            }
            commons.fetchEnergy(creep, false, false);
        }
	}
};

module.exports = roleLorry;
