/*
Curiosity (iterator-fuzzy) - someone who is curious would do this - examine things then move on
*/
module.exports = function(){//dependancies and parentOOP protoptype/classes
    var utils=require('bom-utils'),merge=require('merge'),_=require('underscore'),c0re=require('../c0re')();

    function Curiosity(successFunc, failFunc, opts){
        if(!opts){opts={};}
         c0re.prototype.constructor.apply(this,[successFunc, failFunc, merge(opts,{'unique_prefix':'Curiosity','cycle_type':'iterator','tasker_type':'fuzzy'})]);//extend parent constructor :D
//console.log('Curiosity this',this.prototype.constructor.name,"\n",'c0re.constructor ',c0re.prototype.constructor.name);//,"\n",'tmp: ',tmp
	};
    Curiosity.prototype=Object.create(c0re.prototype);//extend parent
    Curiosity.prototype.constructor=Curiosity;//reinforce typing (debugger shows correct model when you do this but it doesn't really make a difference unless you are type crazy)

    return Curiosity;
}
