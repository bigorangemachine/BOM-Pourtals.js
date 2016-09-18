/*
Morality (generator-fuzzy)
*/
module.exports = function(){//dependancies and parentOOP protoptype/classes
    var utils=require('bom-utils'),merge=require('merge'),_=require('underscore'),c0re=require('../c0re')();

    function Morality(successFunc, failFunc, opts){
        if(!opts){opts={};}
         c0re.prototype.constructor.apply(this,[successFunc, failFunc, merge(opts,{'unique_prefix':'Morality','cycle_type':'generator','tasker_type':'fuzzy'})]);//extend parent constructor :D
//console.log('Morality this',this.prototype.constructor.name,"\n",'c0re.constructor ',c0re.prototype.constructor.name);//,"\n",'tmp: ',tmp
	};
    Morality.prototype=Object.create(c0re.prototype);//extend parent
    Morality.prototype.constructor=Morality;//reinforce typing (debugger shows correct model when you do this but it doesn't really make a difference unless you are type crazy)

    return Morality;
}
