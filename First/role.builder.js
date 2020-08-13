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
	    delete creep.memory.placeToBe;
            creep.say('🔄 harvest');
	    }
	    if (!creep.memory.building && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if (creep.memory.building) {
	        var room = creep.room;
    		do {
    		    var target = Game.getObjectById(creep.memory.targetId);
    		    if (!target) {
    		        var targets = room.find(FIND_CONSTRUCTION_SITES);
    		        if (targets.length) {
        			    target = targets[0];
        			    creep.memory.targetId = target.id;
        			    delete creep.memory.placeToBe;
    		        } else {
        			    var spawn = Game.spawns['Spawn1'];
        			    if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            				creep.say('park');
            				creep.moveTo(spawn, {visualizePathStyle: {stroke: '#ffffff'}});
        			    }
        			    return;
    		        }
    		    }
    		    var place = creep.memory.placeToBe;
    		    if (!place) {
    		        var sources = room.find(FIND_SOURCES);
    		        place = commons.findSuitablePlace(creep, target, sources);
    		        creep.memory.placeToBe = place;
    		    }
    		    if (place && target) {
    		        if (creep.pos.x == place.x && creep.pos.y == place.y) {
                        var err = creep.build(target);
                        if (err != OK) {
                           console.log('Build failed: ' + err);
                        }
                        return;
    		        } else {
				if (creep.pos.isNearTo(place.x, place.y) && room.lookForAt(LOOK_CREEPS, place.x, place.y).length) {
				    delete creep.memory.placeToBe;
				} else {
        			    var err = creep.moveTo(place.x, place.y, {visualizePathStyle: {stroke: '#ffffff'}});
        			    if (err == OK || err == ERR_TIRED) {
            				return;
        			    }
        			    console.log("Failed moveTo(" + JSON.stringify(place) + "), err: " + err);
        			    delete creep.memory.placeToBe;
        			    place = null;
				}
    		        }
    		    }
    		} while (true);
	    } else {
                commons.fetchEnergy(creep);
            }
	}
};

module.exports = roleBuilder;
