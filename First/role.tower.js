var roleTower = {
    run: function(room) {
        var towers = room.find(FIND_MY_STRUCTURES, { filter: {structureType: STRUCTURE_TOWER}});
        if (towers.length) {
            towers.forEach(function(tower) {
                var maxi = [100, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 1000000];
                for (var i=0;i<maxi.length;i++) {
                    if (10*tower.store[RESOURCE_ENERGY]/tower.store.getCapacity(RESOURCE_ENERGY)<i) {
                        break;
                    }
                    if (i>=5 && Game.time % 5 !=0) {
                        break;
                    }
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
