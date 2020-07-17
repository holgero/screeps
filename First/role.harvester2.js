var roleHarvester2 = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // console.log('run');
        var room = creep.room;
        if (creep.memory.placeToBe) {
            // console.log('have place');
            var pos = creep.memory.placeToBe;
            if (creep.pos.x == pos.x && creep.pos.y == pos.y) {
                creep.say('arrived');
                creep.memory.atSource = true;
                delete creep.memory.placeToBe;
            } else if (room.lookForAt(LOOK_CREEPS, pos.x, pos.y).length) {
                // console.log('occupied storage');
                // occupied by someone else
                delete creep.memory.placeToBe;
            } else {
                // console.log('continue going');
                creep.say('goto container');
                creep.moveTo(creep.memory.placeToBe.x, creep.memory.placeToBe.y, {visualizePathStyle: {stroke: '#ffaa00'}});
                return;
            }
        }
        if (creep.memory.atSource) {
            // all is well, continue harvesting
            // console.log('continue harvesting');
            var sources = room.lookForAtArea(LOOK_SOURCES, creep.pos.y-1, creep.pos.x-1, creep.pos.y+1, creep.pos.x+1, true);
            if (sources.length != 1) {
                console.log('Not one single sources in range: ' + JSON.stringify(sources));
            }
            var err = creep.harvest(sources[0].source);
            if (err != OK) {
                console.log('Harvesting ' + JSON.stringify(sources[0].source) + ' failed: ' + err);
            }
            return;
        }
        console.log('find a place');
        // find a suitable source with a container that is not currently harvested
        var sources = room.find(FIND_SOURCES);
        sources.forEach(function (source) {
            var structures = room.lookForAtArea(LOOK_STRUCTURES, source.pos.y-1, source.pos.x-1, source.pos.y+1, source.pos.x+1, true);
            structures.forEach(function (structure) {
                if (structure.structure.structureType == STRUCTURE_CONTAINER) {
                    if (room.lookForAt(LOOK_CREEPS, structure.x, structure.y).length == 0) {
                        creep.memory.placeToBe = structure.structure.pos;
                        creep.moveTo(creep.memory.placeToBe, {visualizePathStyle: {stroke: '#ffaa00'}});
                        return;
                    }
                }
            });
        });
	}
};

module.exports = roleHarvester2;
