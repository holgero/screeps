var strategySpawn = {
    createMissing: function(role, desiredCreeps) {
        var spawn = Game.spawns['Spawn1'];
        var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == role);
        if (spawn.spawning) {
            var spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                spawn.pos.x + 1,
                spawn.pos.y,
                {align: 'left', opacity: 0.8});
            return 0;
        } else {
            if (creeps.length < desiredCreeps) {
                if (spawn.energy > 200) {
                    var newName = _.capitalize(role) + Game.time;
                    console.log('Spawning new ' + role + ': ' + newName);
                    spawn.spawnCreep([WORK,CARRY,MOVE], newName, {memory: {role: role}});
                }
                return 0;
            }
            return 1;
        }
    }
}

module.exports = strategySpawn;
