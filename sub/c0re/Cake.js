/*
Cake (generator-queue) - Create the cake, queue for the cake... find more cake... the cake is a lie; must find more cake
*/
module.exports = function(){//dependancies and parentOOP protoptype/classes
    var utils=require('bom-utils'),merge=require('merge'),_=require('underscore'),c0re=require('../c0re')();

    function Cake(successFunc, failFunc, opts){
        if(!opts){opts={};}
         c0re.prototype.constructor.apply(this,[successFunc, failFunc, merge(opts,{'unique_prefix':'Cake','cycle_type':'generator','tasker_type':'queue'})]);//extend parent constructor :D
//console.log('Cake this',this.prototype.constructor.name,"\n",'c0re.constructor ',c0re.prototype.constructor.name);//,"\n",'tmp: ',tmp
	};
    Cake.prototype=Object.create(c0re.prototype);//extend parent
    Cake.prototype.constructor=Cake;//reinforce typing (debugger shows correct model when you do this but it doesn't really make a difference unless you are type crazy)

    return Cake;
}
