var commons = require('creep.commons');

var roleSoldier = {
    info: {
        roleName: 'soldier',
        minimalBody: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, RANGED_ATTACK, MOVE],
        increaseCarry: false,
        increaseMove: false,
        increaseWork: false,
    },

    revertDirection: function(direction) {
	switch (direction) {
	case TOP:          return BOTTOM;
	case TOP_RIGHT:    return BOTTOM_LEFT;
	case RIGHT:        return LEFT;
	case BOTTOM_RIGHT: return TOP_LEFT;
	case BOTTOM:       return TOP;
	case BOTTOM_LEFT:  return TOP_RIGHT;
	case LEFT:         return RIGHT;
	case TOP_LEFT:     return BOTTOM_RIGHT;
	}
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target) {
	    if (creep.hits <= 200 && creep.pos.inRangeTo(target, 3)) {
	        creep.say('Run!');
	        // console.log('Hits getting low, I should better run now!');
		const path = creep.pos.findPathTo(target);
		creep.move(roleSoldier.revertDirection(path[0].direction));
	    } else {
                // console.log(creep.name + ': I have got a target: ' + JSON.stringify(target));
                if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
            	    creep.moveTo(target);
    	        }
	    }
        }
    }
};

module.exports = roleSoldier;
