var commons = require('creep.commons');

var strategyDevelopment = {
    developRoom: function(level, type, position, count) {
        var spawn = Game.spawns['Spawn1'];
        var room = spawn.room;
        if (room.controller.level >= level) {
            var existing = room.find(FIND_MY_STRUCTURES, { filter: {structureType: type}});
            if (existing.length < count) {
                if (room.find(FIND_MY_CONSTRUCTION_SITES, { filter: {structureType: type}}).length < 1) {
                    var x = position.x+existing.length-Math.ceil(count/2);
                    console.log(LOOK_CONSTRUCTION_SITES, x, position.y);
                    while (_.filter(room.lookAt(x, position.y), function(s) {return s.type == 'constructionSite'}).length) {
                        x++;
                    }
                    while (room.createConstructionSite(x, position.y, type) == ERR_INVALID_TARGET) {
                        x++;
                    }
                }
            }
            return 1;
        }
        return 0;
    },
    developRoads: function(spawn) {
        var room = spawn.room;
        if (!room.memory.roadsCreated) {
            var from = spawn.pos;
            var targets = room.find(FIND_SOURCES);
            targets.push(room.controller);
            targets.forEach(function(source) {
                var path = room.findPath(from, source.pos, { ignoreCreeps: true, ignoreRoads: true, swampCost: 1});
                path.forEach(function(pos) {
                    if (pos.x != source.pos.x || pos.y != source.pos.y) {
                        var err = room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
                        if (err) {
                            console.log('Failed to place road at (' + pos.x + ',' + pos.y + '): ' + err);
                        }
                    }
                });
                room.memory.roadsCreated = true;
            });
        }
    },
    developSwampRoads: function(spawn) {
        var room = spawn.room;
        if (!room.memory.swampRoadsCreated) {
            var from = spawn.pos;
            var targets = room.find(FIND_SOURCES);
            var terrain = room.getTerrain();
            targets.push(room.controller);
            targets.forEach(function(source) {
                var path = room.findPath(from, source.pos, { ignoreCreeps: true, ignoreRoads: true, swampCost: 1});
                path.forEach(function(pos) {
                    if (pos.x != source.pos.x || pos.y != source.pos.y) {
                        if (terrain.get(pos.x, pos.y) == TERRAIN_MASK_SWAMP || terrain.get(pos.x + pos.dx, pos.y + pos.dy) == TERRAIN_MASK_SWAMP) {
                            var err = room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
                            if (err) {
                                console.log('Failed to place road at (' + pos.x + ',' + pos.y + '): ' + err);
                            }
                        }
                    }
                });
                room.memory.swampRoadsCreated = true;
            });
        }
    },
    developContainers: function(spawn) {
        var room = spawn.room;
        if (!room.memory.containersCreated) {
            var sources = room.find(FIND_SOURCES);
            for (var i=0;i<9;i++) {
                sources.forEach(function(source) {
                   var flatPlaces = commons.getFlatTerrain(source.pos);
                   if (flatPlaces.length == i) {
                       room.createConstructionSite(flatPlaces[0], STRUCTURE_CONTAINER);
                   }
                });
            }
            room.memory.containersCreated = true;
        }
    }
}

module.exports = strategyDevelopment;
