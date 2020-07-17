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
                var body;
                if (spawn.room.controller.level < 2) {
                    body = [WORK, CARRY, MOVE];
                } else {
                    body = [WORK, CARRY, CARRY, MOVE, MOVE];
                }
                switch (spawn.room.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_EXTENSION }}).length) {
                    case 0:
                        break;
                    case 1:
                        body.push(MOVE);
                        break;
                    case 2:
                        body.push(MOVE, CARRY);
                        break;
                    case 3:
                    case 4:
                    case 5:
                    default:
                        body.push(MOVE, CARRY, MOVE);
                        break;
                }
                var err = spawn.spawnCreep(body, 'whatever', {memory: {role: role}, dryRun: true});
                if (!err) {
                    var newName = _.capitalize(role) + Game.time;
                    console.log('Spawning new ' + role + ': ' + newName);
                    spawn.spawnCreep(body, newName, {memory: {role: role}});
                } else {
                    if (err != ERR_NOT_ENOUGH_ENERGY) {
                        console.log('Cant spawn a new creep with body ' + body + ': ' + err);
                    }
                }
                return 0;
            }
            return 1;
        }
    }
}

module.exports = strategySpawn;
