var commons = require('creep.commons');

var roleSoldier = {
    info: {
        roleName: 'soldier',
        minimalBody: [ATTACK, MOVE],
        increaseCarry: false,
        increaseMove: false,
        increaseWork: false,
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        console.log('Got a target: ' + JSON.stringify(target));
        if (target) {
            if (creep.attack(target) == ERR_NOT_IN_RANGE) {
            	creep.moveTo(target);
    	    }
        }
    }
};

module.exports = roleSoldier;
