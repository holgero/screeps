var roleTower = {
    run: function(room) {
        var towers = room.find(FIND_MY_STRUCTURES, { filter: {structureType: STRUCTURE_TOWER}});
        if (towers.length) {
            towers.forEach(function(tower) {
                var maxi = [1000, 10000, 100000, 1000000, 10000000];
                for (var i=0;i<maxi.length;i++) {
                    var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => structure.hits < structure.hitsMax && structure.hits < maxi[i] });
                    if (closestDamagedStructure) {
                        tower.repair(closestDamagedStructure);
                        break;
                    }
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
