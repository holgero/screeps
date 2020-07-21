var creepCommons = {
    getWalkableTerrain: function(pos) {
        var room = Game.rooms[pos.roomName];
        var terrain = room.getTerrain();
        var walkable = [];
        for (var x = pos.x - 1; x <= pos.x + 1; x++) {
            for (var y = pos.y - 1; y <= pos.y + 1; y++) {
                if (terrain.get(x,y) != TERRAIN_MASK_WALL ||
                    _.filter(room.lookForAt(LOOK_STRUCTURES,x,y), function(structure) {
                        return structure.structureType == STRUCTURE_ROAD; }).length == 1) {
                    walkable.push(room.getPositionAt(x,y));
                }
            }
        }
        // console.log('Found ' + JSON.stringify(walkable) + ' walkable places around position (' + pos.x + ',' + pos.y + ').');
        return walkable;
    },

    cannotParkOn: function(o) {
        return o.type == LOOK_FLAGS && o.flag.name.startsWith('no parking') ||
            o.type == LOOK_STRUCTURES && o.structure.structureType == STRUCTURE_CONTAINER ||
            o.type == LOOK_STRUCTURES && o.structure.structureType == STRUCTURE_ROAD ||
            o.type == LOOK_TERRAIN && o.terrain == "wall";
    },

    unwalkable: function(o) {
        return o.type == LOOK_STRUCTURES && o.structure.structureType == STRUCTURE_SPAWN ||
            o.type == LOOK_STRUCTURES && o.structure.structureType == STRUCTURE_EXTENSION ||
            o.type == LOOK_STRUCTURES && o.structure.structureType == STRUCTURE_STORAGE ||
            o.type == LOOK_CREEPS;
    },

    noParking: function(room, sources, pos) {
        var stuff = room.lookAt(pos);
        var filtered = _.filter(stuff, creepCommons.cannotParkOn);
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

    findSuitablePlace: function(creep, target, sources, distance=3) {
        var room = creep.room;
        var top = Math.max(0, target.pos.y-distance);
        var left = Math.max(0, target.pos.x-distance);
        var bottom = Math.min(49, target.pos.y+distance);
        var right = Math.min(target.pos.x+distance);
        var areaStuff = room.lookAtArea(top, left, bottom, right);
        // console.log('All around target: ' + JSON.stringify(areaStuff));
        var bestDistance = 99;
        var place = null;
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
                if (_.filter(currentRow, creepCommons.cannotParkOn).length > 0) {
                    continue;
                }
                // console.log(x, y, JSON.stringify(currentRow));
                if (_.filter(currentRow, creepCommons.unwalkable).length > 0) {
                    continue;
                }
                // console.log(x, y, JSON.stringify(currentRow));
                for (var source of sources) {
                    if (source.pos.isNearTo(x,y)) {
                        continue;
                    }
                }
                var distance = creep.pos.getRangeTo(x, y);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    place = creep.room.getPositionAt(x,y);
                }
            }
        }
        return place;
    },

    releaseEnergySources: function(creep) {
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY)==0) {
            delete creep.memory.sourceId;
            delete creep.memory.containerId;
        }
    },

    /** @param {Creep} creep **/
    fetchEnergy: function(creep, harvesting=true) {
        var room = creep.room;

        if (creep.memory.sourceId) {
            var source = Game.getObjectById(creep.memory.sourceId);
            if (!source) {
                delete creep.memory.sourceId;
            } else {
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                return;
            }
        }

        if (creep.memory.containerId) {
            // console.log('Take from container ' + creep.memory.containerId);
            var container = Game.getObjectById(creep.memory.containerId);
            if (!container) {
                delete creep.memory.containerId;
            } else {
                var err = creep.withdraw(container, RESOURCE_ENERGY);
                if (err == OK) {
                    return;
                }
                if (err == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
                    return;
                } else if (err == ERR_NOT_ENOUGH_RESOURCES) {
                    delete creep.memory.containerId;
                } else {
                    console.log('Get energy from container failed with: ' + err);
                }
            }
        }

        var droppedEnergy = room.find(FIND_DROPPED_RESOURCES, { filter: {resourceType: RESOURCE_ENERGY}});
        for (var dropped of droppedEnergy) {
            var err = creep.pickup(dropped);
            if (err == ERR_NOT_IN_RANGE) {
                if (creep.pos.getRangeTo(dropped) < dropped.amount) {
                    creep.moveTo(dropped, {visualizePathStyle: {stroke: '#ffaa00'}});
                    return;
                } else {
                    // console.log('Will not pickup dropped energy (' + dropped.amount + ') at (' + dropped.pos.x + ',' + dropped.pos.y + ')');
                }
            } else if (err == OK) {
                return;
            }
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

        if (!harvesting) {
            return;
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
                var flatPlaceCount = creepCommons.getWalkableTerrain(source.pos).length;
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
