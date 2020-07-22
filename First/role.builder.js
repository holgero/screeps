var commons = require('creep.commons');

var roleBuilder = {
    info: {
        roleName: 'builder',
        minimalBody: [WORK, CARRY, MOVE],
        increaseCarry: true,
        increaseMove: true,
        increaseWork: true,
    },

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
	        var room = creep.room;
	        var targets = room.find(FIND_CONSTRUCTION_SITES);
            if (targets.length) {
                var target = targets[0];
                if (creep.pos.inRangeTo(target.pos, 4)) {
                    // console.log("Target is: " + JSON.stringify(target));
                    var sources = room.find(FIND_SOURCES);
                    if (creep.pos.inRangeTo(target.pos, 3)) {
                        if (commons.noParking(room, sources, creep.pos)) {
                            // console.log('No parking here');
                            var place = commons.findSuitablePlace(creep, target, sources);
                            // console.log(JSON.stringify(place));
                            if (place != null) {
                                var err = creep.moveTo(place, { visualizePathStyle: {stroke: '#ffffff'}, ignoreRoads: true });
                                if (err != OK) {
                                    // console.log(err);
                                }
                                return;
                            }
                        } else {
                            var err = creep.build(target);
                            if (err != OK) {
                               console.log('Build failed: ' + err);
                            }
                            return;
                        }
                    } else {
                        var place = commons.findSuitablePlace(creep, target, sources);
                        if (place != null) {
                            creep.moveTo(place, { visualizePathStyle: {stroke: '#ffffff'}, ignoreRoads: true });
                            return;
                        }
                    }
                }
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
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
