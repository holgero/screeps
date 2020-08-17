var commons = require('creep.commons');

var roleSoldier = {
    info: {
        roleName: 'soldier',
        minimalBody: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, RANGED_ATTACK, MOVE],
        increaseCarry: false,
        increaseMove: false,
        increaseWork: false,
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target) {
	    if (creep.hits <= 200 && creep.pos.inRangeTo(target, 3)) {
	        creep.say('Run!');
	        // console.log('Hits getting low, I should better run now!');
		const path = creep.pos.findPathTo(target);
		var positionToBe = creep.room.getPositionAt(creep.pos.x - 2*path[0].dx, creep.pos.y - 2*path[0].dy);
		creep.moveTo(positionToBe, {visualizePathStyle:{}});
	    } else {
                // console.log(creep.name + ': I have got a target: ' + JSON.stringify(target));
                if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE && creep.hits == creep.hitsMax) {
            	    creep.moveTo(target);
    	        }
	    }
        }
    }
};

module.exports = roleSoldier;
