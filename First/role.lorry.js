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
            creep.say('🔄 fetch');
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
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                var spawn = Game.spawns['Spawn1'];
                if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawn, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        } else {
            commons.fetchEnergy(creep, false);
        }
	}
};

module.exports = roleLorry;
