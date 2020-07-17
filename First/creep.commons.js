var creepCommons = {
    getFlatTerrain: function(pos) {
        var room = Game.rooms[pos.roomName];
        var terrain = room.getTerrain();
        var flatPlaces = [];
        for (var x = pos.x - 1; x <= pos.x + 1; x++) {
            for (var y = pos.y - 1; y <= pos.y + 1; y++) {
                if (terrain.get(x,y) != TERRAIN_MASK_WALL) {
                    flatPlaces.push(room.getPositionAt(x,y));
                }
            }
        }
        // console.log('Found ' + JSON.stringify(flatPlaces) + ' flat places around position (' + pos.x + ',' + pos.y + ').');
        return flatPlaces;
    },

    /** @param {Creep} creep **/
    fetchEnergy: function(creep) {
        var room = creep.room;

        if (creep.memory.sourceIndex) {
            var sources = room.find(FIND_SOURCES);
            var idx = creep.memory.sourceIndex - 1;
            if (creep.harvest(sources[idx]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[idx], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            return;
        }

        var droppedEnergy = room.find(FIND_DROPPED_RESOURCES, { filter: {resourceType: RESOURCE_ENERGY}});
        if (droppedEnergy.length) {
            if (creep.pickup(droppedEnergy[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedEnergy[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            return;
        }
        
        var containers = room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}});
        if (containers.length) {
            var bestContainer = null;
            var maxEnergy=0;
            containers.forEach(function(container) {
                var energy=container.store.getUsedCapacity(RESOURCE_ENERGY);
                if (energy>maxEnergy) {
                    maxEnergy = energy;
                    bestContainer = container;
                }
            });
            if (bestContainer) {
                if (creep.withdraw(bestContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(bestContainer, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                return;
            }
        }

        var sources = room.find(FIND_SOURCES);
        var hostiles = room.find(FIND_HOSTILE_CREEPS);
        var maxEnergy = 0;
        for (var i=0;i<sources.length;i++) {
            var source = sources[i];
            var usable = true;
            hostiles.forEach( function(hostile) {
                if (source.pos.inRangeTo(hostile, 4)) {
                    usable = false;
                }
            });
            if (usable) {
                var flatPlaceCount = creepCommons.getFlatTerrain(source.pos).length;
                if (flatPlaceCount > 1 && source.energy > maxEnergy) {
                    maxEnergy = source.energy;
                    creep.memory.sourceIndex = i + 1;
                }
            }
        }
        if (creep.memory.sourceIndex) {
            var idx = creep.memory.sourceIndex - 1;
            if (creep.harvest(sources[idx]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[idx], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            return;
        }
    }
};

module.exports = creepCommons;
