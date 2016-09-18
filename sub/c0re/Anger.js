/*
Anger (generator-pool)
*/
module.exports = function(){//dependancies and parentOOP protoptype/classes
    var utils=require('bom-utils'),merge=require('merge'),_=require('underscore'),c0re=require('../c0re')();

    function Anger(successFunc, failFunc, opts){
        if(!opts){opts={};}
         c0re.prototype.constructor.apply(this,[successFunc, failFunc, merge(opts,{'unique_prefix':'Anger','cycle_type':'generator','tasker_type':'pool'})]);//extend parent constructor :D
//console.log('Anger this',this.prototype.constructor.name,"\n",'c0re.constructor ',c0re.prototype.constructor.name);//,"\n",'tmp: ',tmp
	};
    Anger.prototype=Object.create(c0re.prototype);//extend parent
    Anger.prototype.constructor=Anger;//reinforce typing (debugger shows correct model when you do this but it doesn't really make a difference unless you are type crazy)

    return Anger;
}
