var strategySpawn = {
    createMissing: function(info, desiredCreeps) {
        var spawn = Game.spawns['Spawn1'];
        if (spawn.spawning) {
            return 0;
        }
        var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == info.roleName);
        if (creeps.length >= desiredCreeps) {
            return 1;
        }
        var creepAdditions = 0;
        if (spawn.room.controller.level >= 2) {
            creepAdditions++;
        }
        creepAdditions += Math.ceil(spawn.room.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_EXTENSION }}).length/1.5);
        var body = info.minimalBody.slice();
        while (creepAdditions > 0) {
            if (creepAdditions > 0 && info.increaseMove) {
                body.push(MOVE);
                creepAdditions--;
            }
            if (creepAdditions > 0 && info.increaseCarry) {
                body.push(CARRY);
                creepAdditions--;
            }
            if (creepAdditions > 0 && info.increaseMove) {
                body.push(MOVE);
                creepAdditions--;
            }
            if (creepAdditions > 0 && info.increaseWork) {
                body.push(WORK);
                creepAdditions-=2;
            }
        }
        var newName = _.capitalize(info.roleName) + '-' + Game.time;
        while (body.length > info.minimalBody.length && spawn.spawnCreep(body, newName, {memory: {role: info.roleName}, dryRun: true}) == ERR_NOT_ENOUGH_ENERGY) {
            body.pop();
        }
        var err = spawn.spawnCreep(body, newName, {memory: {role: info.roleName}, dryRun: true});
        if (!err) {
            console.log('Spawning new ' + info.roleName + ': ' + newName);
            spawn.spawnCreep(body, newName, {memory: {role: info.roleName}});
        } else {
            if (err != ERR_NOT_ENOUGH_ENERGY) {
                console.log('Cant spawn a new "' + info.roleName + '" creep with body ' + body + ': ' + err);
            }
        }
        return 0;
    },
}

module.exports = strategySpawn;
