var commons = require('creep.commons');

var roleMedic = {
    info: {
        roleName: 'medic',
        minimalBody: [HEAL, MOVE],
        increaseCarry: false,
        increaseMove: false,
        increaseWork: false,
    },

    /** @param {Creep} creep **/
    run: function(creep) {
	const target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
	    filter: function(object) {
		return object.hits < object.hitsMax;
	    }
	});
	if (target) {
	    if (creep.heal(target) == ERR_NOT_IN_RANGE) {
	        creep.moveTo(target);
	    }
	}
    }
};

module.exports = roleMedic;
