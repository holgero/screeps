var strategyDevelopment = {
    developRoom: function(level, type, position, count) {
        var spawn = Game.spawns['Spawn1'];
        var room = spawn.room;
        if (room.controller.level >= level) {
            var existing = room.find(FIND_MY_STRUCTURES, { filter: {structureType: type}});
            if (existing.length < count) {
                if (room.find(FIND_MY_CONSTRUCTION_SITES, { filter: {structureType: type}}).length < 1) {
                    var err = room.createConstructionSite(position.x+existing.length, position.y, type);
                    console.log('createConstructionSite for ' + type + ': ' + err);
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
                room.memory.roadsCreated = 1;
            });
        }
    }
}

module.exports = strategyDevelopment;
