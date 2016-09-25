module.exports = function(){//dependancies
    var GLaDioS=require('GLaDioS')(),
        c0re=require('./sub/c0re')(),
        Wheatley=require('./sub/c0re/Wheatley')(),
        Anger=require('./sub/c0re/Anger')(),
        Cake=require('./sub/c0re/Cake')(),
        Curiosity=require('./sub/c0re/Curiosity')(),
        Morality=require('./sub/c0re/Morality')(),
        Paranoia=require('./sub/c0re/Paranoia')(),
        c0reModel=require('./sub/c0reModel')(),
        utils=require('bom-utils'),merge=require('merge'),_=require('underscore');

    var event_whitelist=['init','ready','start','exit'];//order matters

    var self_init=function(){//private methods
            var self=this;
        },
        do_ready=function(){
            var self=this;
            if(self.status==='init'){
                self._SCOPE_.status='ready';
                self._SCOPE_.large_queue['ready'].execute();
            }
        },
        do_start=function(){
            var self=this;
            if(self.status==='ready'){
                if(self._SCOPE_.large_queue['start'].list.all.length===0){//this is a problem!!!!
                    throw new Error("[c0redP] Large Queue 'start' have no tasks.");
                    self.do_exit();// self._SCOPE_.large_queue['exit'].execute();
                }else{
                    self._SCOPE_.status='start';
                    self._SCOPE_.large_queue['start'].execute();
                }
            }
        };


    function c0redP(endFunc,opts){
        if(arguments.length===1 && typeof(endFunc)==='object'){opts=endFunc;}//single argument!
        else if(arguments.length===1 && typeof(endFunc)!=='function'){throw new Error("[c0redP] First argument is not valid. Expecting a function");}
        if(!opts){opts={};}

        this._SCOPE_={
            'large_queue':{},
            'loud':(typeof(opts.loud)==='boolean'?opts.loud:false),
            'silent':(typeof(opts.silent)==='boolean'?opts.silent:true),
            'status': false
        };
//UPDATE THIS! to  this._SCOPE_={};
        //private variables - need to be objects
        var self=this,//tmp
            protected_obj={},
            protected_getter=function(keyIn){return function(){
                return protected_obj[keyIn];
                //return (protected_obj[keyIn] instanceof Array || protected_obj[keyIn].constructor===Object?utils.clone(protected_obj[keyIn]):protected_obj[keyIn]);}
            }},
            protected_setter=function(keyIn){return function(v){protected_obj[keyIn]=v;}},
            readonly_obj={'readonlyitem':'publickey'},
            readonly_getter=function(keyIn){return function(){return readonly_obj[keyIn]}},
            readonly_getter_SCOPE=function(keyIn){return function(){return self._SCOPE_[keyIn]}};
        if((typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function'))){//use pre IE9
            //protected

            //readonly
            this.__defineGetter__('large_queue', readonly_getter_SCOPE('large_queue'));
            this.__defineGetter__('readonlyitem', readonly_getter('readonlyitem'));
            this.__defineGetter__('status', readonly_getter_SCOPE('status'));
            this.__defineGetter__('silent', readonly_getter_SCOPE('silent'));
            this.__defineGetter__('loud', readonly_getter_SCOPE('loud'));
        }else{
            //protected

            //readonly
            Object.defineProperty(this, 'large_queue', {'get': readonly_getter_SCOPE('large_queue')});
            Object.defineProperty(this, 'readonlyitem', {'get': readonly_getter('readonlyitem')});
            Object.defineProperty(this, 'status', {'get': readonly_getter_SCOPE('status')});
            Object.defineProperty(this, 'silent', {'get': readonly_getter_SCOPE('silent')});
            Object.defineProperty(this, 'loud', {'get': readonly_getter_SCOPE('loud')});
        }
        //var large_queue={};
        event_whitelist.forEach(function(v,i,arr){
            (function(evKey){
                if(evKey=='init'){
                    var done_func_pos=function(){
                            if(self.loud){console.log('Wheatley - v[init] is done successful');}
    //console.log("self._SCOPE_.large_queue['ready'].list: ",self._SCOPE_.large_queue['ready'].list.all.length);console.log("self._SCOPE_.large_queue['ready'].list: ",self._SCOPE_.large_queue['ready'].list.all);process.exit();
                            do_ready.apply(self);
                        },
                        done_func_neg=function(){
                            if(self.loud){console.log('Wheatley - v[init] is done unsuccessful');}
                            self.do_exit();// self._SCOPE_.large_queue['exit'].execute();
                        };
                }else if(evKey=='ready'){
                    var done_func_pos=function(){
                            if(self.loud){console.log('Wheatley - v[ready] pos fired! is done successful');}
                            do_start.apply(self);
                        },
                        done_func_neg=function(){
                            if(self.loud){console.log('Wheatley - v[ready] neg fired! is done unsuccessful');}
                            self.do_exit();// self._SCOPE_.large_queue['exit'].execute();
                        };
                }else if(evKey=='start'){
                    var done_func_pos=function(){//on success shut down
                            if(self.loud){console.log('Paranoia - v[start] pos fired! is done successful');}
                            self.do_exit();
                        },
                        done_func_neg=function(){
                            if(self.loud){console.log('Paranoia - v[start] neg fired! is done unsuccessful');}
                            self.do_exit();
                        };
                        // done_func_pos=self.do_exit.bind(self);
                        // done_func_neg=self.do_exit.bind(self);
                }else{// if(evKey=='exit'){
                    var done_func_pos=function(){
                            if(self.loud){console.log('Paranoia - v[exit] pos fired! is done successful');}
                            if(typeof(endFunc)==='function'){endFunc();}
                            else{process.exit();}
                        },
                        done_func_neg=function(){
                            if(self.loud){console.log('Paranoia - v[exit] neg fired! is done unsuccessful');}
                            if(typeof(endFunc)==='function'){endFunc();}
                            else{process.exit();}
                        };
                }

                if(evKey=='start' || evKey=='exit'){
                    //self._SCOPE_.large_queue[v]=new c0re(function(){},function(){},{'unique_prefix':'Paranoia','cycle_type':'iterator','tasker_type':'pool'});
                    self._SCOPE_.large_queue[evKey]=new Paranoia(done_func_pos, done_func_neg,{'unique_prefix':evKey});//,'pool_size':20,'fps':60
                }else{
                    //self._SCOPE_.large_queue[v]=new c0re(function(){},function(){},{'unique_prefix':'Wheatley','cycle_type':'iterator','tasker_type':'queue'});
                    self._SCOPE_.large_queue[evKey]=new Wheatley(done_func_pos, done_func_neg, {'unique_prefix':evKey}); //,'fps':30
                }
                // new c0reModel(function(){},function(){},function(){});
            })(v);
//console.log('self._SCOPE_.large_queue['+v+'].unique_prefix',self._SCOPE_.large_queue[v].unique_prefix);
        });


        //public methods
        c0redP.prototype.on=function(typeIn,funcIn,optsIn){
            var self=this;
//console.log("\n");
//console.log('c0redP.prototype.on ',arguments);
//console.log('self ',self._SCOPE_.large_queue);
            if(typeof(typeIn)!=='string' || _.indexOf(event_whitelist,typeIn)===-1){throw new Error("[c0redP] Binding action was passed invalid typeIn (1st Argument) is '"+typeIn.toString()+"' expecting '"+event_whitelist.join(', ')+"'.");return false;}
            else if(typeof(funcIn)!=='function'){throw new Error("[c0redP] Binding action was passed invalid callback (2nd Argument); function expected.");return false;}
            else if(typeof(self._SCOPE_.large_queue[typeIn])==='undefined'){throw new Error("[c0redP] Provided type '"+typeIn.toString()+"' is not set in 'large_queue'.");return false;}
            var output=self._SCOPE_.large_queue[typeIn].enqueue(funcIn,function(){/*WIP*/},optsIn);//do not use public large_queue!!!!
// console.log('[c0redP] ON( '+typeIn.toUpperCase()+'): self._SCOPE_.large_queue['+typeIn+'].unique_prefix: ',self._SCOPE_.large_queue[typeIn].unique_prefix);//
// console.log("\n");
            return output;
        };
        c0redP.prototype.do_init=function(){
            var self=this;

            if(self.status===false){
//console.log("[c0redP] DO INIT!\n",self._SCOPE_.large_queue['init'],"\nUNIQUE_PREFIX: ",self._SCOPE_.large_queue['init'].unique_prefix);
                if(typeof(arguments[0])==='function'){self.on('init',arguments[0],{'priority':0});}
                self._SCOPE_.status='init';
                self._SCOPE_.large_queue['init'].execute();//do not use public self._SCOPE_.large_queue!!!!
            }

        };
        c0redP.prototype.do_exit=function(){
            var self=this;
            if(self.status!==false && self.status!=='exit'){
//console.log("[c0redP] DO EXIT!\n",self._SCOPE_.large_queue['exit'],"\nUNIQUE_PREFIX: ",self._SCOPE_.large_queue['exit'].unique_prefix,"\n"+"arguments.length: ",arguments.length);
                if(typeof(arguments[0])==='function'){self.on('exit',arguments[0],{'priority':0});}
                self._SCOPE_.status='exit';
                self._SCOPE_.large_queue['exit'].execute();//do not use public self._SCOPE_.large_queue!!!!
            }else{
                if(!self.silent){console.warn("[c0redP] Could not exit because of current status '"+self.status+"'.");}
            }
        };
		self_init.apply(this,[opts]);//start! self_init that passes the 'this' context through
	};

    return c0redP;
}
