var creepCommons = {
    visualizePath: function(room, path) {
        var points = [];
        path.forEach(function(pos) {
           points.push([pos.x, pos.y]);
        });
        room.visual.poly(points, {fill: 'transparent', stroke: '#ffaa00', lineStyle: 'dashed', strokeWidth: .15, opacity: .1 });
    },
    moveTo: function(creep, position) {
        // return values: 0: arrived, 1: moving, 2: waiting
        if (creep.pos.isEqualTo(position)) {
            delete creep.memory.movePath;
            delete creep.memory.waitCounter;
            return 0;
        }
        var room = creep.room;
        var path;
        if (creep.memory.movePath) {
            path = Room.deserializePath(creep.memory.movePath);
            // console.log(creep.name + ", cached path: " + JSON.stringify(path));
            if (!path.length || path[path.length-1].x != position.x || path[path.length-1].y != position.y) {
                delete creep.memory.waitCounter;
                delete creep.memory.movePath;
            }
        }
        if (!creep.memory.movePath) {
            var path = room.findPath(creep.pos, position, {ignoreCreeps: true});
            // console.log("Calculated path: " + JSON.stringify(path));
            creep.memory.movePath = Room.serializePath(path);
        }
        path = Room.deserializePath(creep.memory.movePath);
        if (creep.pos.isEqualTo(path[0].x, path[0].y)) {
            // have moved in the last tick, update path
            path.shift();
            creep.memory.movePath = Room.serializePath(path);
        }
        creepCommons.visualizePath(room, path);
        var nextPosition = room.getPositionAt(path[0].x, path[0].y);
        var otherCreeps = room.lookForAt(LOOK_CREEPS, nextPosition);
        if (!otherCreeps.length) {
            var err = creep.move(path[0].direction);
            // console.log(creep.name + ", going " + path[0].direction + " got: " + err);
            delete creep.memory.waitCounter;
            return 1;
        }
        var otherCreep = otherCreeps[0];
        if (!otherCreep.memory.movePath) {
            // the other creep is not moving
            if (path.length > 1) {
                // going further, so find a way around this obstacle
                var deviation = room.findPath(creep.pos, room.getPositionAt(path[1].x, path[1].y));
                path.shift(); // position of other creep
                path.shift(); // position just behind other creep
                path = deviation.concat(path);
                // console.log("Path with avoidance of sitting creep: " + JSON.stringify(path));
                creep.memory.movePath = Room.serializePath(path);
                return 2;
            }
            // it is blocking my target, no other option than to wait for it to move
            return 2;
        }
        var otherCreepsPath = Room.deserializePath(otherCreep.memory.movePath);
        if (otherCreep.pos.isEqualTo(otherCreepsPath[0].x, otherCreepsPath[0].y)) {
            otherCreepsPath.shift();
            if (!otherCreepsPath.length) {
                // the other creep is at its destination, we wait a tick and then continue above
                delete otherCreep.memory.movePath;
                return 2;
            }
        }
        if (creep.pos.isEqualTo(otherCreepsPath[0].x, otherCreepsPath[0].y)) {
            // the other creep intends to move to my position, so we can switch positions
            creep.move(path[0].direction);
            delete creep.memory.waitCounter;
            return 1;
        }
        if (!creep.memory.waitCounter) {
            creep.memory.waitCounter = 10;
        } else {
            creep.memory.waitCounter--;
            if (!creep.memory.waitCounter) {
                console.log("Waited too long, try a new path avoiding other creeps");
                var path = room.findPath(creep.pos, position, {ignoreCreeps: false});
                console.log("Calculated path: " + JSON.stringify(path));
                creep.memory.movePath = Room.serializePath(path);
            }
        }
        // keep distance to the other creep
        return 2;
    },
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
        if (o.type == LOOK_CREEPS) {
            return true;
        }
        if (o.type == LOOK_STRUCTURES) {
            return o.structure.structureType == STRUCTURE_SPAWN ||
                o.structure.structureType == STRUCTURE_EXTENSION ||
                o.structure.structureType == STRUCTURE_STORAGE ||
                o.structure.structureType == STRUCTURE_WALL ||
                o.structure.structureType == STRUCTURE_TOWER;
        }
        if (o.type == LOOK_CONSTRUCTION_SITES) {
            return o.constructionSite.structureType == STRUCTURE_SPAWN ||
                o.constructionSite.structureType == STRUCTURE_EXTENSION ||
                o.constructionSite.structureType == STRUCTURE_STORAGE ||
                o.constructionSite.structureType == STRUCTURE_WALL ||
                o.constructionSite.structureType == STRUCTURE_TOWER;
        }
        return false;
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
        var top = Math.max(1, target.pos.y-distance);
        var left = Math.max(1, target.pos.x-distance);
        var bottom = Math.min(48, target.pos.y+distance);
        var right = Math.min(48, target.pos.x+distance);
        var areaStuff = room.lookAtArea(top, left, bottom, right);
        // console.log('All around target: ' + JSON.stringify(areaStuff));
        var candidates = [];
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
                candidates.push(room.getPositionAt(x,y));
            }
        }
        if (!candidates.length) {
            // console.log('Did not find a place near: ' + JSON.stringify(target.pos));
            return null;
        }
        if (candidates.length==1) {
            return candidates[0];
        }
        return creep.pos.findClosestByPath(candidates);
    },

    releaseEnergySources: function(creep) {
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY)==0) {
            delete creep.memory.sourceId;
            delete creep.memory.containerId;
        }
    },
    
    findSuitableContainer: function(creep, room, creeps, useStorage) {
        if (useStorage && room.storage && room.storage.store[RESOURCE_ENERGY] > creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
            creep.memory.containerId = room.storage.id;
            return;
        }
        for (var tombstone of room.find(FIND_TOMBSTONES)) {
            if (tombstone.store[RESOURCE_ENERGY] > 0) {
                creep.memory.containerId = tombstone.id;
                return;
            }
        }
        var containers = room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}});
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
                creep.memory.containerId = container.id;
            }
        });
    },
    
    gotoSpawn: function(creep, room) {
        var spawns = room.find(FIND_MY_SPAWNS);
        var spawn;
        if (spawns && spawns.length) {
            spawn = spawns[0];
        } else {
            spawn = Game.spawns["Spawn1"];
        }
        if (creepCommons.moveTo(creep, spawn.pos) == 0) {
            delete creep.memory.movePath;
            return 0;
        }
        return 1;
    },

    /** @param {Creep} creep **/
    fetchEnergy: function(creep, harvesting=true, useStorage=true) {
        var room = creep.room;
        var creeps = room.find(FIND_MY_CREEPS);

        for (var dropped of room.find(FIND_DROPPED_RESOURCES, { filter: {resourceType: RESOURCE_ENERGY}})) {
            var err = creep.pickup(dropped);
            if (err == ERR_NOT_IN_RANGE) {
                if (creep.pos.getRangeTo(dropped) < dropped.amount) {
                    creepCommons.moveTo(creep, dropped.pos);
                    return;
                }
            } else {
                delete creep.memory.movePath;
            }
        }
        
        if (creep.memory.sourceId) {
            var source = Game.getObjectById(creep.memory.sourceId);
            if (!source) {
                delete creep.memory.sourceId;
            } else {
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creepCommons.moveTo(creep, source.pos);
                } else {
                    delete creep.memory.movePath;
                }
                return;
            }
        }

        if (!creep.memory.containerId) {
            creepCommons.findSuitableContainer(creep, room, creeps, useStorage);
        }

        if (creep.memory.containerId) {
            // console.log('Take from container ' + creep.memory.containerId);
            var container = Game.getObjectById(creep.memory.containerId);
            if (!container) {
                delete creep.memory.containerId;
            } else {
                var err = creep.withdraw(container, RESOURCE_ENERGY);
                if (err == ERR_NOT_IN_RANGE) {
                    creepCommons.moveTo(creep, container.pos);
                    return;
                } 
                delete creep.memory.movePath;
                if (err == OK) {
                    return;
                }
                if (err == ERR_NOT_ENOUGH_RESOURCES) {
                    delete creep.memory.containerId;
                } else {
                    console.log('Get energy from container failed with: ' + err);
                    delete creep.memory.containerId;
                }
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
