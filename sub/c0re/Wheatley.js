/*
Wheatley (iterator-queue) - Narrator
*/
module.exports = function(){//dependancies and parentOOP protoptype/classes
    var utils=require('bom-utils'),merge=require('merge'),_=require('underscore'),c0re=require('../c0re')();

    function Wheatley(successFunc, failFunc, opts){
        if(!opts){opts={};}
         c0re.prototype.constructor.apply(this,[successFunc, failFunc, merge(opts,{'unique_prefix':(typeof(opts.unique_prefix)==='string'?opts.unique_prefix+'-':'')+'Wheatley','cycle_type':'iterator','tasker_type':'queue'})]);//extend parent constructor :D
	};
    Wheatley.prototype=Object.create(c0re.prototype);//extend parent
    Wheatley.prototype.constructor=Wheatley;//reinforce typing (debugger shows correct model when you do this but it doesn't really make a difference unless you are type crazy)

    return Wheatley;
}
