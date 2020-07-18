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

        if (creep.memory.sourceId) {
            var source = Game.getObjectById(creep.memory.sourceId);
            if (!source) {
                delete creep.memory.sourceId;
            } else {
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                } else if (creep.store.getFreeCapacity(RESOURCE_ENERGY)==0) {
                    delete creep.memory.sourceId;
                }
                return;
            }
        }

        if (creep.memory.containerId) {
            // console.log('Take from container ' + creep.memory.containerId);
            var container = Game.getObjectById(creep.memory.containerId);
            if (container == null) {
                delete creep.memory.containerId;
            } else {
                // console.log("Try withdraw from " + JSON.stringify(container));
                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // console.log("Will move to container");
                    creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
                } else {
                    delete creep.memory.containerId;
                }
                return;
            }
        }

        var droppedEnergy = room.find(FIND_DROPPED_RESOURCES, { filter: {resourceType: RESOURCE_ENERGY}});
        if (droppedEnergy.length) {
            if (creep.pickup(droppedEnergy[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedEnergy[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            return;
        }
        
        var containers = room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}});
        var creeps = room.find(FIND_MY_CREEPS);
        if (containers.length) {
            var bestContainer = null;
            var maxEnergy=creep.store.getFreeCapacity(RESOURCE_ENERGY);
            containers.forEach(function(container) {
                var energy=container.store.getUsedCapacity(RESOURCE_ENERGY);
                creeps.forEach(function(creep) {
                    if (creep.memory.containerId == container.id) {
                        energy-=creep.store.getCapacity(RESOURCE_ENERGY);
                    }
                });
                if (energy >= maxEnergy) {
                    maxEnergy = energy;
                    bestContainer = container;
                }
            });
            if (bestContainer) {
                creep.memory.containerId = bestContainer.id;
                return;
            }
        }

        var sources = room.find(FIND_SOURCES);
        var hostiles = room.find(FIND_HOSTILE_CREEPS);
        var usableSources = [];
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
                creeps.forEach(function(creep) {
                    if (creep.memory.sourceId == source.id) {
                        flatPlaceCount--;
                    }
                });
                if (flatPlaceCount > 0 && source.energy > 0) {
                    usableSources.push(source);
                }
            }
        }
        if (usableSources.length == 1) {
            creep.memory.sourceId =  usableSources[0].id;
        } else if (usableSources.length > 1) {
            // console.log('Found sources: ' + JSON.stringify(usableSources));
            var source = creep.pos.findClosestByPath(usableSources);
            if (source != null) {
                creep.memory.sourceId = source.id;
            } else {
                creep.memory.sourceId = usableSources[0].id;
            }
        }
    }
};

module.exports = creepCommons;
