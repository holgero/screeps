var roleSpawn = {
    run: function(spawn) {
        if (spawn.spawning) {
            return;
        }
        var nearbyCreeps = spawn.room.lookForAtArea(LOOK_CREEPS, spawn.pos.y-1, spawn.pos.x-1, spawn.pos.y+1, spawn.pos.x+1, true);
        // console.log('Renew creeps, found: ' + nearbyCreeps.length);
        nearbyCreeps.forEach(function(nearCreep) {
            var creep = nearCreep.creep;
            // console.log('Inspect creep ' + JSON.stringify(creep));
            if (creep.my && creep.ticksToLive < 1000) {
                var err = spawn.renewCreep(creep);
                console.log('Renew creep: ' + err);
            }
        });
    }
};

module.exports = roleSpawn;
