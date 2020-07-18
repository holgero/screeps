var commons = require('creep.commons');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        commons.releaseEnergySources(creep);

	    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if (!creep.memory.building && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if (creep.memory.building) {
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                var spawn = Game.spawns['Spawn1'];
                if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.say('park');
                    creep.moveTo(spawn, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
	    } else {
            commons.fetchEnergy(creep);
        }
	}
};

module.exports = roleBuilder;
