var roleHarvester2 = {
    info: {
        roleName: 'harvester2',
        minimalBody: [WORK, WORK, MOVE],
        increaseCarry: false,
        increaseMove: false,
        increaseWork: true,
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        // console.log('run');
        var room = creep.room;
        if (creep.memory.goRenewal) {
            if (creep.ticksToLive >= 1400) {
                delete creep.memory.goRenewal;
                creep.say('resume');
            } else {
                creep.say('renewing');
                var spawn = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN }})[0];
                if (!creep.pos.isNearTo(spawn.pos)) {
                    creep.moveTo(spawn.pos.x, spawn.pos.y, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                return;
            }
        }
        if (creep.memory.placeToBe) {
            // console.log('have place');
            var pos = creep.memory.placeToBe;
            if (creep.pos.x == pos.x && creep.pos.y == pos.y) {
                creep.say('arrived');
                delete creep.memory.placeToBe;
            } else if (room.lookForAt(LOOK_CREEPS, pos.x, pos.y).length) {
                // console.log('occupied storage');
                // occupied by someone else
                delete creep.memory.placeToBe;
                delete creep.memory.sourceId;
            } else {
                // console.log('continue going');
                creep.moveTo(creep.memory.placeToBe.x, creep.memory.placeToBe.y, {visualizePathStyle: {stroke: '#ffaa00'}});
                return;
            }
        }
        if (creep.memory.sourceId) {
            var source = Game.getObjectById(creep.memory.sourceId);
            if (source == null) {
                delete creep.memory.sourceId;
            } else {
                if (creep.ticksToLive < 200) {
                    creep.memory.goRenewal = true;
                    creep.memory.placeToBe = creep.pos;
                }
                //console.log(JSON.stringify(room.lookForAt(LOOK_RESOURCES, creep.pos)));
                if (room.lookForAt(LOOK_RESOURCES, creep.pos).length == 0) {
                    var err = creep.harvest(source);
                    if (err == ERR_NOT_ENOUGH_RESOURCES) {
                        // console.log('Source exhausted');
                    } else if (err != OK) {
                        console.log('Harvesting ' + JSON.stringify(source) + ' failed: ' + err);
                    }
                }
                return;
            }
        }
        // console.log('find a place');
        // find a suitable source with a container that is not currently harvested
        var sources = room.find(FIND_SOURCES);
        sources.forEach(function (source) {
            var structures = room.lookForAtArea(LOOK_STRUCTURES, source.pos.y-1, source.pos.x-1, source.pos.y+1, source.pos.x+1, true);
            structures.forEach(function (structure) {
                if (structure.structure.structureType == STRUCTURE_CONTAINER) {
                    if (room.lookForAt(LOOK_CREEPS, structure.x, structure.y).length == 0) {
                        creep.memory.placeToBe = structure.structure.pos;
                        creep.memory.sourceId = source.id;
                        creep.moveTo(creep.memory.placeToBe, {visualizePathStyle: {stroke: '#ffaa00'}});
                        return;
                    } else if (creep.pos.isEqualTo(structure.structure.pos)) {
                        creep.memory.sourceId = source.id;
                    }
                }
            });
        });
	}
};

module.exports = roleHarvester2;
