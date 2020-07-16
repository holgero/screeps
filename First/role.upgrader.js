var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.memory.sourceIndex++;
            creep.say('🔄 harvest');
	    }
	    if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if (creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            var sources = creep.room.find(FIND_SOURCES);
            if (!creep.memory.sourceIndex || creep.memory.sourceIndex >= sources.length) {
                creep.memory.sourceIndex = 0;
            }
            var hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
            if (hostiles.length) {
                while (sources[creep.memory.sourceIndex].pos.inRangeTo(hostiles[0], 4)) {
                    creep.memory.sourceIndex++;
                }
            }
            if (creep.memory.sourceIndex >= sources.length) {
                creep.memory.sourceIndex = 0;
            }
            if(creep.harvest(sources[creep.memory.sourceIndex]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[creep.memory.sourceIndex], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
	}
};

module.exports = roleUpgrader;