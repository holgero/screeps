var commons = require('creep.commons');

var roleExplorer = {
    info: {
        roleName: 'explorer',
        minimalBody: [CLAIM, MOVE, MOVE, MOVE],
        increaseCarry: false,
        increaseMove: false,
        increaseWork: false,
    },

    /** @param {Creep} creep **/
    run: function(creep) {
    	var room = creep.room;
    	if (room.controller && !room.controller.my) {
    	    if (creep.claimController(room.controller) == ERR_NOT_IN_RANGE) {
    	        creep.moveTo(room.controller);
    	    }
    	    return;
    	}
    	var flags = room.find(FIND_FLAGS, {
    	    filter: function(object) {
    	            return object.name.startsWith('Explore');
        		}
    	});
    	if (flags && flags.length) {
    	    creep.moveTo(flags[0].pos);
    	    return;
    	}
    }
};

module.exports = roleExplorer;
