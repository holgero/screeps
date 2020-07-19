var commons = require('creep.commons');

var roleBuilder = {
    info: {
        roleName: 'builder',
        minimalBody: [WORK, CARRY, MOVE],
        increaseCarry: true,
        increaseMove: true,
        increaseWork: true,
    },
    cannotParkOn: function(o) {
        return o.type == LOOK_FLAGS && o.flag.name.startsWith('no parking') ||
            o.type == LOOK_STRUCTURES && o.structure.structureType == STRUCTURE_CONTAINER ||
            o.type == LOOK_STRUCTURES && o.structure.structureType == STRUCTURE_ROAD ||
            o.type == LOOK_TERRAIN && o.terrain == "wall";
    },
    noParking: function(room, sources, pos) {
        var stuff = room.lookAt(pos);
        var filtered = _.filter(stuff, roleBuilder.cannotParkOn);
        // console.log(JSON.stringify(filtered));
        if (filtered.length>0) {
            return true;
        }
        for (var source of sources) {
            if (source.pos.isNearTo(pos)) {
                return true;
            }
        }
        return false;
    },
    findSuitablePlace: function(creep, target, sources) {
        var room = creep.room;
        var top = Math.max(0, target.pos.y-3);
        var left = Math.max(0, target.pos.x-3);
        var bottom = Math.min(49, target.pos.y+3);
        var right = Math.min(target.pos.x+3);
        var areaStuff = room.lookAtArea(top, left, bottom, right);
        // console.log('All around target: ' + JSON.stringify(areaStuff));
        for (var y=top; y<=bottom; y++) {
            for (var x=left; x<=right; x++) {
                if (target.pos.isEqualTo(x, y)) {
                    continue;
                }
                if (creep.pos.isEqualTo(x, y)) {
                    continue;
                }
                var currentRow = areaStuff[y][x];
                // console.log(x, y, JSON.stringify(currentRow));
                if (_.filter(currentRow, roleBuilder.cannotParkOn).length > 0) {
                    continue;
                }
                for (var source of sources) {
                    if (source.pos.isNearTo(x,y)) {
                        continue;
                    }
                }
                return creep.room.getPositionAt(x,y);
            }
        }
        return null;
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
                    var sources = room.find(FIND_SOURCES);
                    if (creep.pos.inRangeTo(target.pos, 3)) {
                        if (roleBuilder.noParking(room, sources, creep.pos)) {
                            var place = roleBuilder.findSuitablePlace(creep, target, sources);
                            if (place != null) {
                                creep.moveTo(place, { visualizePathStyle: {stroke: '#ffffff'}, ignoreRoads: true });
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
                        var place = roleBuilder.findSuitablePlace(creep, target, sources);
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
