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
            var targets = creep.room.find(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION
                                || structure.structureType == STRUCTURE_SPAWN
                                || structure.structureType == STRUCTURE_TOWER
                                || structure.structureType == STRUCTURE_STORAGE) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });
            function ordinalOf(target) {
                switch (target.structureType) {
                    case STRUCTURE_SPAWN: return 1;
                    case STRUCTURE_EXTENSION: return 2;
                    case STRUCTURE_TOWER: return 3;
                    case STRUCTURE_STORAGE: return 4;
                    default: return 5;
                }
            };
            targets.sort((a,b) => ordinalOf(a) - ordinalOf(b));
            if (targets.length > 0) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    commons.moveTo(creep, targets[0].pos);
                } else {
                    delete creep.memory.movePath;
                }
            } else {
                creep.say('park');
                commons.gotoSpawn(creep, creep.room);
            }
        } else {
            commons.fetchEnergy(creep, true, false);
        }
	}
};

module.exports = roleHarvester;
