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
                var err = spawn.spawnCreep([WORK,CARRY,MOVE], 'whatever', {memory: {role: role}, dryRun: true});
                if (!err) {
                    var newName = _.capitalize(role) + Game.time;
                    console.log('Spawning new ' + role + ': ' + newName);
                    spawn.spawnCreep([WORK,CARRY,MOVE], newName, {memory: {role: role}});
                } else if (err != ERR_NOT_ENOUGH_ENERGY) {
                    console.log('Cant spawn a new creep: ' + err);
                }
                return 0;
            }
            return 1;
        }
    }
}

module.exports = strategySpawn;
