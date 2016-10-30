//
module.exports=function(){//dependancies
    var GLaDioS=require('GLaDioS')(),utils=require('bom-utils'),merge=require('merge'),_=require('underscore');

    //statics
    var schema={'data':{}},// status, unique_id, is_next, result_args, severity & priority are readonly! - data is developer's storage
        severity_whitelist=['none','critical'],//first is the default!
        status_whitelist=['ready','next','busy','idle','pos','neg','completed'],//first is the default!
        resolved_whitelist=['pos','neg','completed'];
    /*
     * c0reModel(doFunc)
     * c0reModel(doFunc,opts)
     * c0reModel(posFunc,negFunc,doFunc,opts)
     * c0reModel(posFunc,negFunc,doFunc,idleFunc,opts)
     */
    function c0reModel(posFunc,negFunc,doFunc,idleFunc,opts){//the last arg is opts! as long as its an object!
        if(arguments.length>=3 && (typeof(posFunc)!=='function' && typeof(negFunc)!=='function' && typeof(doFunc)!=='function')){throw new Error("[c0reModel] First, Second & Third argument must be a function.");return {};}
        else if(arguments.length<3 && typeof(arguments[0])==='function'){var doFunc=arguments[0];}
        else if(arguments.length<1){throw new Error("[c0reModel] Invalid arguments.");return {};}
        if(typeof(arguments[arguments.length-1])==='object'){opts=arguments[arguments.length-1];}//last object found is opts!
        if(arguments.length>=3){
            posFunc=(typeof(posFunc)=='function'?posFunc:false);
            negFunc=(typeof(negFunc)=='function'?negFunc:false);
            doFunc=(typeof(doFunc)=='function'?doFunc:false);
            idleFunc=(typeof(idleFunc)=='function'?idleFunc:false);
        }
        if(!opts){opts={};}//100% sure
        if(!opts.hook_ins){opts.hook_ins={};}//100% sure
        if(typeof(doFunc)!=='function'){throw new Error("[c0reModel] Was not passed a valid 'do' function.");return {};}
        this.hook_ins=new GLaDioS({
            'do': (typeof(opts.hook_ins.do)==='function'?opts.hook_ins.do:false),
            'idle': (typeof(opts.hook_ins.idle)==='function'?opts.hook_ins.idle:false),
            'pos': (typeof(opts.hook_ins.pos)==='function'?opts.hook_ins.pos:false),
            'neg': (typeof(opts.hook_ins.neg)==='function'?opts.hook_ins.neg:false)
        }, this);
        var self_init=function(opts){//private methods
                var self=this;
                self.hook_ins.change_text('do', "[GENERICDB] When action is started or when the status is changed to 'busy'.");
                self.hook_ins.change_text('idle', "[GENERICDB] When action is flagged as idle (WIP).");
                self.hook_ins.change_text('pos', "[GENERICDB] When there has been a positive assertion.");
                self.hook_ins.change_text('neg', "[GENERICDB] When there has been a negative assertion.");
//console.log("[c0reModel] self_init ",self_init);
                self.reset();//transfers the schema into inital_opts
                self._SCOPE_.inital_opts.unique_id=self.unique_id;
            };

        this._SCOPE_={
            //'resolved_list':resolved_whitelist,
            'inital_opts':utils.clone( (typeof(opts)!=='undefined'?opts:schema) ),//intensive! - break pass by reference
            'result_args':[],
            'priority':(typeof(opts.priority)==='number' && !isNaN(opts.priority) && opts.priority>0?Math.abs(Math.ceil(opts.priority)):0),
            'severity':(typeof(opts.severity)==='string' && _.indexOf(severity_whitelist, opts.severity.toLowerCase())!==-1?opts.severity:severity_whitelist[0]),
            'status': status_whitelist[0],
            'unique_prefix': (typeof(opts.unique_prefix)==='string' && typeof(opts.unique_prefix.toString())==='string'?opts.unique_prefix.toString():''),
            'unique_id': false,
            'stamp': new Date(),
            'task_action':{
                'do':(typeof(doFunc)==='function'?doFunc:false),
                'pos':(typeof(posFunc)==='function'?posFunc:false),
                'neg':(typeof(negFunc)==='function'?negFunc:false),
                'idle':(typeof(idleFunc)==='function'?idleFunc:false)
            },
            'task_return':{
                'do':undefined,
                'pos':undefined,
                'neg':undefined,
                'idle':undefined
            }
        };
        
        //private variables - need to be objects
        var is_executable=function(){return (this.status==='ready'?true:false);},
            is_next=function(){return (this.status==='next'?true:false);},
            is_queued=function(){return ( _.indexOf(['next','busy','idle'], this.status)!==-1 ?true:false);},
            is_completed=function(){return ( _.indexOf(['pos','neg','completed'], this.status)!==-1 ?true:false);},
            is_success=function(){return (this.status==='pos'?true:false);},
            task_return_get=function(){return this._SCOPE_.task_return;},
            task_return_set=function(v){
                if(typeof(v)!=='undefined'){this._SCOPE_.task_return=v;}
            },
            result_args_set=function(v){
                if(v instanceof Array){this._SCOPE_.result_args=v;}
                else{throw new Error("[c0reModel] Cannot set 'result_args': must be an Array.");}
            },
            result_args_get=function(){return this._SCOPE_.result_args;},
            priority_get=function(){return this._SCOPE_.priority;},
            severity_get=function(){return this._SCOPE_.severity;},
            status_get=function(){return this._SCOPE_.status;},
            status_set=function(v){
                if(typeof(v)!=='string' || _.indexOf(status_whitelist, v.toLowerCase())===-1){//v===false ||
                    throw new Error("[c0reModel] Invalid value for status; a string with a value of '"+status_whitelist.join(', ')+"' expected; value received '"+v.toString()+"'.");}
                else{//this._SCOPE_.status=(v!==false?v.toLowerCase():false);
                    this._SCOPE_.status=v.toLowerCase();}
            },
            update_stamp=function(){this._SCOPE_.stamp=new Date();};
        if((typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function'))){//use pre IE9
            this.__defineSetter__('status', status_set);
            this.__defineGetter__('status', status_get);
            this.__defineSetter__('result_args', result_args_set);
            this.__defineGetter__('result_args', result_args_get);
            this.__defineSetter__('task_return', task_return_set);
            this.__defineGetter__('task_return', task_return_get);
            this.__defineGetter__('is_executable', is_executable);
            this.__defineGetter__('is_next', is_next);
            this.__defineGetter__('is_queued', is_queued);
            this.__defineGetter__('is_completed', is_completed);
            this.__defineGetter__('is_success', is_success);
            this.__defineGetter__('severity', severity_get);
            this.__defineGetter__('priority', priority_get);
            this.__defineGetter__('unique_prefix', function(){return this._SCOPE_.unique_prefix;});
            this.__defineGetter__('unique_id', function(){return this._SCOPE_.unique_id;});
            this.__defineGetter__('tasks', function(){return this._SCOPE_.task_action;});
            //this.__defineGetter__('resolved_list', function(){return this._SCOPE_.resolved_list;});
        }else{
            Object.defineProperty(this, 'status', {
                'set': status_set,//setter
                'get': status_get//getter
            });
            Object.defineProperty(this, 'result_args', {
                'set': result_args_set,//setter
                'get': result_args_get//getter
            });
            Object.defineProperty(this, 'task_return', {
                'set': task_return_set,//setter
                'get': task_return_get//getter
            });
            Object.defineProperty(this, 'is_executable', {'get': is_executable});
            Object.defineProperty(this, 'is_next', {'get': is_next});
            Object.defineProperty(this, 'is_queued', {'get': is_queued});
            Object.defineProperty(this, 'is_completed', {'get': is_completed});
            Object.defineProperty(this, 'is_success', {'get': is_success});
            //Object.defineProperty(this, 'result_args', {'get': result_args_get});
            Object.defineProperty(this, 'severity', {'get': severity_get});
            Object.defineProperty(this, 'priority', {'get': priority_get});
            Object.defineProperty(this, 'unique_prefix', {'get': function(){return this._SCOPE_.unique_prefix;}});
            Object.defineProperty(this, 'unique_id', {'get': function(){return this._SCOPE_.unique_id;}});
            Object.defineProperty(this, 'tasks', {'get': function(){return this._SCOPE_.task_action;}});
            //Object.defineProperty(this, 'resolved_list', {'get': function(){return this._SCOPE_.resolved_list;}});

        }
        //these need private scope access!
        c0reModel.prototype.action=function(key, args, func, rootObj){
            var self=this;
            if(typeof(key)==='string' && self.hook_ins.has_callback(key) && self.hook_ins.has(key)){
                if(typeof(rootObj)==='object'){self.hook_ins.reroot(rootObj);}
                self.hook_ins.icallback(key, (typeof(args)==='object'?args:{}), func);
            }
        };
        c0reModel.prototype.reset=function(){
            var self=this,
                unique_extra=(typeof(self.unique_prefix)==='string' && utils.basic_str(self.unique_prefix)?self.unique_prefix+'-':'')+(new Date().getTime().toString())+'-';
            if(this._SCOPE_.unique_id===false){
//console.log('PRE self.unique_id',self.unique_id, ' typeof(self._SCOPE_.inital_opts.unique_id) ',typeof(self._SCOPE_.inital_opts.unique_id), ' opts ',opts);
                var do_once=false,
                    exclude_id_list=(opts.exclude_ids instanceof Array?opts.exclude_ids:[]),
                    new_id=(typeof(self._SCOPE_.inital_opts.unique_id)!=='string'?unique_extra+utils.zero_pad_front(utils.getRandomInt(1,Number.MAX_SAFE_INTEGER),Number.MAX_SAFE_INTEGER.toString().length):self._SCOPE_.inital_opts.unique_id);
                do{//this should only run twice
                    if(do_once){
                        new_id=unique_extra+utils.zero_pad_front(utils.getRandomInt(1,Number.MAX_SAFE_INTEGER),Number.MAX_SAFE_INTEGER.toString().length);}
                    else if(!do_once && new_id===self._SCOPE_.inital_opts.unique_id && _.indexOf(exclude_id_list, new_id)!==-1){
                        throw new Error("[c0reModel] Passed 'unique_id' is found inside the exclusion list.");}
                    //else{}
                    do_once=true;
                }while(_.indexOf(exclude_id_list, new_id)!==-1);
                //readonly setter of uninitalized variable!
                this._SCOPE_.unique_id=new_id;
//console.log('POST self.unique_id',self.unique_id);
            }
            //model setter!
            for(var s in schema){//set schema default
                if(utils.obj_valid_key(schema, s)){
                    this[s]=(typeof(self._SCOPE_.inital_opts[s])!=='undefined'?utils.clone(self._SCOPE_.inital_opts[s]):schema[s]);
            }}


            self.status=status_whitelist[0];
            self.result_args=[];
            update_stamp.apply(this);
            this._SCOPE_.stamp=new Date();
        };
        (function(self){
            /* DECALRED BELOW DYNAMICALLY! -> status_whitelist.forEach(function(v,i,arr){ ... });
             *    c0reModel.prototype.mark_next=function(){}
             *    c0reModel.prototype.mark_busy=function(){}
             *    c0reModel.prototype.mark_idle=function(){}
             *    c0reModel.prototype.mark_completed=function(){}
             *    c0reModel.prototype.mark_pos=function(){}
             *    c0reModel.prototype.mark_neg=function(){}
            */
            var get_marker=function(curr,focalItem){
                    return function(){
                        var valid_previous=focalItem.prev_list,
                            call_action=(typeof(focalItem.action)!=='undefined' && focalItem.action!==false?focalItem.action:false);
//console.log("[coreModel] self.status ",self.status,' self.unique_id ',self.unique_id, ' this._SCOPE_.unique_id ',self._SCOPE_.unique_id)
                        if(_.indexOf(valid_previous, self.status)===-1){throw new Error("[c0reModel] Cannot mark as '"+focalItem.readable+"'. Current status must be '"+valid_previous.join(', ')+"'; currently '"+self.status+"'.");return;}
                        self.status=curr;
                        //self._SCOPE_.status=curr;
                        update_stamp.apply(self);
                        if(!call_action){self.action(call_action);}
                    };
                },
                pos_neg=['busy','idle'],
                mapper={
                  //'ready':[], <- not used!
                    'next':{'prev_list': ['ready'],'readable': 'next'},
                    'busy':{'prev_list': ['next'],'action': 'do','readable': 'busy'},
                    'idle':{'prev_list': ['busy'],'action': 'idle','readable': 'idle'},
                    'completed':{'prev_list': ['idle'],'readable': 'completed (timedout)'},
                    'pos':{'prev_list': pos_neg,'action': 'pos','readable': 'positive (successfully completed)'},
                    'neg':{'prev_list': pos_neg,'action': 'neg','readable': 'negative (unsuccessfully completed)'}
                };
            status_whitelist.forEach(function(v,i,arr){
                var func_str='mark_'+v;
                if(utils.obj_valid_key(mapper, v)){//intentionally skips 'ready' - //c0reModel.prototype[func_str]=get_marker(v,mapper[v]).bind(self);
                    self[func_str]=get_marker(v,mapper[v]);}
            });
        })(this);
		self_init.apply(this, [opts]);//start! self_init that passes the 'this' context through
//console.log("["+this.constructor.name+"] POST SELF_INIT()");
	};

    //public methods
    // c0reModel.prototype.xxxx=function(){
    // };

    return c0reModel;


};
