var roleTower = {
    run: function(room) {
        var towers = room.find(FIND_MY_STRUCTURES, { filter: {structureType: STRUCTURE_TOWER}});
        if (towers.length) {
            towers.forEach(function(tower) {
                var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL || structure.hits < structure.hitsMax / 30000 });
                if(closestDamagedStructure) {
                    tower.repair(closestDamagedStructure);
                }
                var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (closestHostile) {
                    tower.attack(closestHostile);
                }
            });
        }
    }
};

module.exports = roleTower;
