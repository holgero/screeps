var commons = require('creep.commons');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
	    if (creep.memory.feeding && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.feeding = false;
            creep.say('🔄 harvest');
	    }
	    if (!creep.memory.feeding && creep.store.getFreeCapacity() == 0) {
	        creep.memory.feeding = true;
            delete creep.memory.sourceId;
	        creep.say('🚧 feed');
	    }

	    if (creep.memory.feeding) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION
                                || structure.structureType == STRUCTURE_SPAWN
                                 || structure.structureType == STRUCTURE_TOWER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });
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
            commons.fetchEnergy(creep);
        }
	}
};

module.exports = roleHarvester;
