var strategyDevelopment = {
    developRoom: function(level, type, position) {
        var spawn = Game.spawns['Spawn1'];
        var room = spawn.room;
        if (room.controller.level >= level) {
            var existing = room.find(FIND_MY_STRUCTURES, { filter: {structureType: type}});
            if (existing.length < 1) {
                if (room.find(FIND_MY_CONSTRUCTION_SITES, { filter: {structureType: type}}).length < 1) {
                    var err = room.createConstructionSite(position, type);
                    console.log('createConstructionSite for ' + type + ': ' + err);
                }
            }
            return 1;
        }
        return 0;
    }
}

module.exports = strategyDevelopment;
