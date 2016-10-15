/*
### Names of other portal sphere/AI characters (refer to c0re/ for used characters)
* Space
* Adventure
* Fact
* Bomb
* Final Hours
* Unused
* Party
* Turrets
* Atlas & P-body
* Companion Cube

*/
module.exports = function(){//dependancies
    var GLaDioS=require('GLaDioS')(),
        c0reModel=require('./c0reModel')(),
        utils=require('bom-utils'),merge=require('merge'),_=require('underscore');


    var determinative_whitelist=['all', '~all', 'pos'],
        valid_cycles=['iterator','generator'], //iterator completes the tasts once (auto stoppage) - generator does things again (manual stoppage)
        valid_taskers=['queue','pool','fuzzy'];

    var self_init=function(){//private methods

        };
    function c0re(successFunc, failFunc, opts){
        if(!opts){opts={};}
//console.log('[c0re] CONSTRUCTOR  opts',opts);
        opts=merge(true,{},opts);//break PBR
        opts.cycle_type=(typeof(opts.cycle_type)==='string'?opts.cycle_type.toLowerCase():valid_cycles[0]);
        opts.tasker_type=(typeof(opts.tasker_type)==='string'?opts.tasker_type.toLowerCase():valid_taskers[0]);
        opts.cycle_type=(_.indexOf(valid_cycles, opts.cycle_type)!==-1?opts.cycle_type:valid_cycles[0]);//verified found!
        opts.tasker_type=(_.indexOf(valid_taskers, opts.tasker_type)!==-1?opts.tasker_type:valid_taskers[0]);

        opts.fps=(typeof(opts.fps)==='number' && !isNaN(opts.fps)?Math.abs(Math.ceil(opts.fps)):15);

        opts.fps_readonly=(typeof(opts.fps_readonly)==='boolean'?opts.fps_readonly:true);
        opts.fps_readonly=(opts.cycle_type.toLowerCase()==='iterator'?true:opts.fps_readonly);

        //wrapped so I can use 'self' (this gets confusing in the below with all the hidden scopes)
        (function(){
        var self=this,info_obj={},fps={},silent_obj={},small_cycle_obj={},large_cycle_obj={},pool_size={},readonly_opts={};
var queue_use_RO=false;//this was testing getters/setters... should remove this
//queue_use_RO=true;

        self._SCOPE_={
            'end_callbacks':{'success':successFunc, 'fail':failFunc},
            'queue':[],
            'temp_queue':[],
            'info_obj':{
                'idlist':{'queue':[],'complete':[],'next':[],'all':[],'temp':[]},
                'rebuild':function(){
                    var do_pushes=function(obj,idIn,isTemp){
                            self._SCOPE_.info_obj.idlist.all.push(idIn);
                            if(isTemp){self._SCOPE_.info_obj.idlist.temp.push(idIn);}
//console.log('obj.is_queued ',obj.is_queued,"\nOBJ: ",obj);
                            if(obj.is_queued){self._SCOPE_.info_obj.idlist.queue.push(idIn);}
                            if(obj.is_completed){self._SCOPE_.info_obj.idlist.complete.push(idIn);}
                            if(obj.is_next){self._SCOPE_.info_obj.idlist.next.push(idIn);}
                        },
                        current_list=self.queue,
                        current_tmp_list=self.temp_queue;
                    for(var key in self._SCOPE_.info_obj.idlist){if(utils.obj_valid_key(self._SCOPE_.info_obj.idlist,key)){self._SCOPE_.info_obj.idlist[key]=[];}}
                    //
    //console.log("[C0RE BUILD_INDEX] current_list: ",current_list,"\n",'self.queue ',self.queue);
                    if(current_tmp_list.length>0){for(var t=0;t<current_tmp_list.length;t++){
                        do_pushes(current_tmp_list[t],current_tmp_list[t].unique_id,true);}}
                    if(current_list.length>0){for(var q=0;q<current_list.length;q++){
                        do_pushes(current_list[q],current_list[q].unique_id,false);}}
                    // xxxxxx[xxxx].resolved_list;
                    // xxxxxx[xxxx].xxxxxx;
                },
                'find_id':function(strIn, getTemp){
                    var seek_pos=_.indexOf(self._SCOPE_.info_obj.idlist.all, strIn),
                        current_list=self.queue,
                        current_tmp_list=self.temp_queue;
                    if(!getTemp){getTemp=false;}
                    if(seek_pos===-1){return false;}
                    //if we're not looking in current_tmp_list but its found in the hidden index
                    if(!getTemp && _.indexOf(self._SCOPE_.info_obj.idlist.temp, strIn)!==-1){return false;}
                    var output={},
                        found={'model':{}, 'is_temp':false, 'is_found':false};

                    if(current_tmp_list.length>0){for(var t=0;t<current_tmp_list.length;t++){if(current_tmp_list[t].unique_id===strIn){found={'model':current_tmp_list[t], 'is_temp':true, 'is_found':true};}}}
                    //do not set is_temp this is important
                    if(current_list.length>0){for(var q=0;q<current_list.length;q++){found={'model':current_list[q], 'is_found':true};}}
                    return (output.is_found?output:false);
                },
                'free_size':function(){
                    var pool_diff=self.pool_size-self._SCOPE_.info_obj.idlist.queue.length;//+self._SCOPE_.info_obj.idlist.complete.length
                    return (pool_diff>=0?pool_diff:0);
                },
                'all_complete':function(){
                    if(self._SCOPE_.info_obj.idlist.complete>=self._SCOPE_.info_obj.idlist.all){return true;}
                    return false;
                }
            },
            'async_opts':{
                'pool_size':{
                    'val':(typeof(opts.pool_size)!=='undefined'?opts.pool_size:1),
                    'setter':function(numIn){
                        var clean_num=numIn;
                        clean_num=Math.abs(Math.ceil( (typeof(clean_num)!=='number'?parseInt(clean_num):clean_num) ));
                        clean_num=(isNaN(clean_num) || clean_num===null || clean_num<=0?1:clean_num);
                        clean_num=(this.tasker_type!=='queue'?clean_num:1);
                        if(self.pool_size!==clean_num){//actually changed! - do an async value change
                            if(this.tasker_type==='queue' && clean_num>1){throw new Error("[c0re] Tasker type '"+this.tasker_type+"' cannot change pool size.");}
                            enqueue_once.apply(self, [ function(){self._SCOPE_.async_opts.pool_size.val=clean_num;} ]);
                        }
                    }
                },
                'fps':{
                    'val':opts.fps,
                    'setter':function(v){
                        if(!self.fps_readonly){
throw new Error("This needs to be changed");process.exit();//does it?! - building tests check after that
                            var clean_num=v;
                            clean_num=Math.abs(Math.ceil( (typeof(clean_num)!=='number'?parseInt(clean_num):clean_num) ));
                            clean_num=(isNaN(clean_num) || clean_num===null || clean_num<=0?self.fps:clean_num);
                            if(self.fps!==clean_num){//actually changed! - do an async value change
                                enqueue_once.apply(self, [ function(){self._SCOPE_.async_opts.fps.val=clean_num;} ]);
                            }
                        }
                    }
                }
            },
            'readonly_opts':{
                'temp_queue':[],'queue':[], //'temp_queue':self._SCOPE_.temp_queue,'queue':self._SCOPE_.queue, <- NOT USED!
                'cycle_type':opts.cycle_type,'tasker_type':opts.tasker_type,
                'fps_readonly':opts.fps_readonly,
                'determinative':(typeof(opts.determinative)==='string' && _.indexOf(determinative_whitelist, opts.determinative.toLowerCase())!==-1?opts.determinative.toLowerCase():determinative_whitelist[0]),
                'unique_prefix':(typeof(opts.unique_prefix)==='string'?opts.unique_prefix:false)
            }
        };

        var async_getter=function(keyIn){return function(){return self._SCOPE_.async_opts[keyIn].val;};};
        fps={//should be obsolete
            'val':opts.fps,
            'fpsgetter':function(){return self._SCOPE_.fps.val;},
            'fpssetter':function(v){
                if(!self.fps_readonly){
throw new Error("This needs to be changed");process.exit();
                    var clean_num=v;
                    clean_num=Math.abs(Math.ceil( (typeof(clean_num)!=='number'?parseInt(clean_num):clean_num) ));
                    clean_num=(isNaN(clean_num) || clean_num===null || clean_num<=0?self.fps.val:clean_num);
                    if(self._SCOPE_.fps.val!==clean_num){//actually changed! - do an async value change
                        self.large_cycle.cancel_func();
                        self._SCOPE_.fps.val=clean_num;//this sets the new value! self.fps=clean_num;
                        self.small_cycle.init_func(function(){//take the small cycle callback and trigger the large one later ;)
                            self.large_cycle.init_func();//pickup the new fps value because its async ;)
                        });
                    }
                }
            }
        };
        silent_obj={'_val':(typeof(opts.silent)==='boolean'?opts.silent:false)};
        small_cycle_obj={
            'del_history':false,
            'use_history':true,
            'history':[],
            'task_id':false,
            'init_func':function(func){//smash the thread safely
                var init_result=(utils.isNode()?setImmediate.bind(self, func):requestAnimationFrame.bind(self, func));
                self.small_cycle.id=init_result();
                return init_result;
            },
            'cancel_func':function(idIn){
                var cancel_result=(utils.isNode()?clearImmediate.bind(self, self.small_cycle.id):cancelAnimationFrame.bind(self, self.small_cycle.id));
                self.small_cycle.id=false;
                return cancel_result;
            }
        };
        large_cycle_obj={
            'del_history':false,
            'use_history':true,
            'history':[],
            'task_id':false,
            'init_func':function(func){
                var binded=setInterval.bind(self, func, (1000/self.fps));
                self.large_cycle.id=binded();//auto cancels!
            },
            'cancel_func':function(idIn){
                clearInterval(self.large_cycle.id);
                self.large_cycle.id=false;
            }
        };
        cycle_get=function(typeIn){
            return function(){return (typeIn==='large'?large_cycle_obj.task_id:small_cycle_obj.task_id);}
        };
        cycle_set=function(typeIn){
            return function(v){
                var focal=(typeIn==='large'?self.large_cycle:self.small_cycle);
                if(focal.use_history && typeof(v)==='number' && _.indexOf(focal.history, v)!==-1){
                    if(!self.silent){console.warn("[c0re] has already used this task id "+v+".");}
                    //otherwise do nothing!
                }else if(v===false || ((!utils.isNode() && typeof(v)==='number') || (utils.isNode() && typeof(v)==='object')) ){
                    if(typeof(focal.cancel_func)==='function' && (typeof(focal.task_id)==='number' || typeof(v)==='object') ){//make sure its 100% cancelled
                        var seek_pos=_.indexOf(focal.history, v),
                            do_cancel=true;//assume we always want to cancel unless its not in the history when history is enabled
                        if(focal.use_history && seek_pos!==-1){
                            if(!self.silent){console.warn("[c0re] has stopped task "+focal.task_id+" from being auto-cancelled.");}
                            do_cancel=false;
                        }
                        if(do_cancel){
                            focal.cancel_func();
                            focal.task_id=false;
                            if(focal.use_history && focal.del_history){utils.array_del_at(focal.history, seek_pos);}
                        }
                    }
                    if((typeof(v)==='number' || typeof(v)==='object') && focal.use_history){focal.history.push(v);}
                    focal.task_id=v;
                }else{
                    throw new Error("[c0re] Setting '"+typeIn+"_cycle_obj.id' must be a "+(utils.isNode()?'object':'number')+" or false. Recieved '"+v.toString()+"'.");
                }
            };
        };
        readonly_getter=function(keyIn){return function(){return self._SCOPE_.readonly_opts[keyIn]}};
//console.log("[CORE INIT 27] self._SCOPE_.info_obj ",self._SCOPE_.info_obj,"\n",'opts ',opts);
        var scope_set=function(keyIn){
                return function(v){
//console.log("[c0re] scope_set: ","\n",typeof(v),"\n",v);
                    var all_found=true;
                    if(v instanceof Array){for(var i=0;i<v.length;i++){if(!(v[i] instanceof c0reModel)){all_found=false;break;}}}
                    if(all_found!==true || !(v instanceof Array)){throw new Error("[c0re] Could not change enque.  Wasn't passed an Array of c0reModels.");}
                    if(keyIn=='temp'){self._SCOPE_.temp_queue=v;}
                    else{self._SCOPE_.queue=v;}
                    console.log("======");
                };
            },
            scope_get=function(keyIn){
                return function(){
                    if(keyIn=='temp'){return self._SCOPE_.temp_queue;}else{return self._SCOPE_.queue;}};
            };

        if((typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function'))){//use pre IE9
            //readonly!
            this.__defineGetter__('silent', function(){return silent_obj._val;});
            this.__defineGetter__('pool_size', function(){return async_getter('pool_size').apply(self);});
            this.__defineGetter__('fps_readonly', readonly_getter('fps_readonly'));
            if(queue_use_RO){
                this.__defineGetter__('temp_queue', readonly_getter('temp_queue'));
                this.__defineGetter__('queue', readonly_getter('queue'));
            }
            this.__defineGetter__('determinative', readonly_getter('determinative'));
            this.__defineGetter__('cycle_type', readonly_getter('cycle_type'));
            this.__defineGetter__('tasker_type', readonly_getter('tasker_type'));
            this.__defineGetter__('unique_prefix', readonly_getter('unique_prefix'));
            this.__defineGetter__('list', function(){return self._SCOPE_.info_obj.idlist;});

            //getters & setters!
            this.__defineGetter__('fps', function(){return async_getter('fps').apply(self);});
            this.__defineSetter__('fps', function(v){self._SCOPE_.async_opts['fps'].setter(v);});

            if(!queue_use_RO){
                this.__defineGetter__('queue', scope_get());
                this.__defineSetter__('queue',  scope_set());
                this.__defineGetter__('temp_queue', scope_get('temp'));
                this.__defineSetter__('temp_queue', scope_set('temp'));
            }

            //custom
            this.__defineGetter__('large_cycle', function(){return large_cycle_obj;});
            this.__defineGetter__('small_cycle', function(){return small_cycle_obj;});
                large_cycle_obj.__defineGetter__('id', cycle_get('large'));
                large_cycle_obj.__defineSetter__('id', cycle_set('large'));
                small_cycle_obj.__defineGetter__('id', cycle_get('small'));
                small_cycle_obj.__defineSetter__('id', cycle_set('small'));
        }else{
            //readonly!
            Object.defineProperty(this, 'silent', {'get': function(){return silent_obj._val;}});
            Object.defineProperty(this, 'pool_size', {'get': function(){return async_getter('pool_size').apply(self);}});
            Object.defineProperty(this, 'fps_readonly', {'get': readonly_getter('fps_readonly')});

            if(queue_use_RO){
                Object.defineProperty(this, 'temp_queue', {'get': readonly_getter('temp_queue')});
                Object.defineProperty(this, 'queue', {'get': readonly_getter('queue')});
            }
            Object.defineProperty(this, 'determinative', {'get': readonly_getter('determinative')});
            Object.defineProperty(this, 'cycle_type', {'get': readonly_getter('cycle_type')});
            Object.defineProperty(this, 'tasker_type', {'get': readonly_getter('tasker_type')});
            Object.defineProperty(this, 'unique_prefix', {'get': readonly_getter('unique_prefix')});
            Object.defineProperty(this, 'list', {'get': function(){return self._SCOPE_.info_obj.idlist;}});

            //getters & setters!
            Object.defineProperty(this, 'fps', {'get': function(){return async_getter('fps').apply(self);}, 'set':function(v){self._SCOPE_.async_opts['fps'].setter(v);} });
            if(!queue_use_RO){
                Object.defineProperty(this, 'queue', {'get': scope_get(), 'set': scope_set()});
                Object.defineProperty(this, 'temp_queue', {'get': scope_get('temp'), 'set': scope_set('temp')});
            }

            //custom
            Object.defineProperty(this, 'large_cycle', {'get': function(){return large_cycle_obj;}});
            Object.defineProperty(this, 'small_cycle', {'get': function(){return small_cycle_obj;}});
                Object.defineProperty(large_cycle_obj, 'id', {'get': cycle_get('large'), 'set': cycle_set('large')});
                Object.defineProperty(small_cycle_obj, 'id', {'get': cycle_get('small'), 'set': cycle_set('small')});
        }

        var do_task=function(){//not used?!
                var self=this;
            },
            enqueue_once=function(func){//super next :D
                var self=this;
                if(queue_use_RO){
//console.log("[c0re enqueue_once] USE READ ONLY MODE!");
                    self._SCOPE_.readonly_opts.temp_queue.push( (func instanceof c0reModel?func:new c0reModel(function(){},function(){},func,{'unique_prefix':self.unique_prefix,'exclude_ids':self.list.all}))  );
                }else{
                    self._SCOPE_.temp_queue.push( (func instanceof c0reModel?func:new c0reModel(function(){},function(){},func,{'unique_prefix':self.unique_prefix,'exclude_ids':self.list.all}))  );
                    // self.temp_queue.push( (func instanceof c0reModel?func:new c0reModel(function(){},function(){},func,{'unique_prefix':self.unique_prefix,'exclude_ids':self.list.all}))  );
                }
                self.rebuild_info();
            },
            enqueue=function(func){
                var self=this;
                if(queue_use_RO){
//console.log("[c0re enqueue] USE READ ONLY MODE!");
                    self._SCOPE_.readonly_opts.queue.push( (func instanceof c0reModel?func:new c0reModel(function(){},function(){},func,{'unique_prefix':self.unique_prefix,'exclude_ids':self.list.all}))  );
//console.log("[CORE ENQUEUE PRIVATE] - "+self.unique_prefix,"\self._SCOPE_.readonly_opts.queue.length ",self._SCOPE_.readonly_opts.queue.length);
                }else{
                    self._SCOPE_.queue.push( (func instanceof c0reModel?func:new c0reModel(function(){},function(){},func,{'unique_prefix':self.unique_prefix,'exclude_ids':self.list.all}))  );
                    // self.queue.push( (func instanceof c0reModel?func:new c0reModel(function(){},function(){},func,{'unique_prefix':self.unique_prefix,'exclude_ids':self.list.all}))  );
//console.log("[CORE ENQUEUE PRIVATE] - "+self.unique_prefix,"\nself.queue.length ",self.queue.length);

                }
                self.rebuild_info();
            };

        try{
            self._SCOPE_.async_opts.pool_size.setter(self._SCOPE_.async_opts.pool_size.val);//self cleaning ^_^
        }catch(e){
            if(!self.silent){console.warn("[c0re] Pool size initialization threw an error:\n"+e.toString());}
        }

        opts.hook_ins=(typeof(opts.hook_ins)!=='object'?{}:opts.hook_ins);
        this.hook_ins=new GLaDioS({
            'task_result': (typeof(opts.hook_ins.task_result)==='function'?opts.hook_ins.task_result:false),
            'xxxxxxx': (typeof(opts.hook_ins.xxxxxxx)==='function'?opts.hook_ins.xxxxxxx:false)
        });
        self.hook_ins.change_text('task_result', "[c0re] When task-chain has completed; this is the callback during the determinative phase to evaluate the result of the tasks");
        self.hook_ins.change_text('xxxxxxx', "[c0re] aaaaaa");


        //these need private scope access!
        c0re.prototype.set_pool=function(numIn){//experimental - change the pool size later!
            var self=this;
            if(!self.silent){console.warn("[c0re] pool size changes in an ansyc method");}
            throw new Error("[c0re] enqueue_pool_change not tested");
            self._SCOPE_.async_opts.pool_size.setter(numIn);
        };
        c0re.prototype.enqueue_next=function(funcIn,callbacks,optsIn){//everyone else takes the bus when it comes to 'next'
            var self=this;
            return self.enqueue(funcIn,callbacks,merge(true,optsIn,{'priority':Number.MAX_SAFE_INTEGER}));
        };
        c0re.prototype.enqueue=function(funcIn,callbacks,optsIn){
            var self=this;
            optsIn=(typeof(optsIn)==='undefined'?{}:optsIn);

            // manage callbacks argument
            callbacks=(typeof(callbacks)==='function'?{'pos':callbacks,'neg':callbacks}:callbacks);
//console.log('[C0RE enqueue] callbacks',callbacks,"\n",'self.unique_prefix ',self.unique_prefix,"\n");
            if(typeof(funcIn)!=='function'){throw new Error("[c0re] Could not 'enqueue' because first argument was not a function");return false;}
            if(arguments.length>=2){//self.enqueue(func,func,{}) ====> self.enqueue(funcIn,{'pos':func,'neg':func}) ====> self.enqueue(funcIn,{'pos':func,'neg':func}, {})
                if(typeof(callbacks)==='function'){callbacks={'pos':callbacks,'neg':callbacks};}
                else if(typeof(callbacks)!=='object'){throw new Error("[c0re] Could not 'enqueue' because second argument was not a function.");return false;}
                else if(typeof(callbacks.pos)!=='function' || typeof(callbacks.neg)!=='function'){throw new Error("[c0re] Could not 'enqueue' because second argument was not an object containing 'pos' and 'neg' which are functions.");return false;}
                else if(typeof(callbacks.idle)!=='undefined' && typeof(callbacks.idle)!=='function'){throw new Error("[c0re] Could not 'enqueue' because second argument is an object containing 'idle' it is not a function.");return false;}
            }else if(arguments.length===1){
                callbacks={'pos':function(){},'neg':function(){}};//enqueue doesn't require callback function; however strict enforcement is required in the execution
            }
            callbacks=merge(true,{
                'do':funcIn,
                'idle':(typeof(callbacks)==='object' && typeof(callbacks.idle)==='function'?callbacks.idle:false),
                'pos':(typeof(callbacks)==='object' && typeof(callbacks.pos)==='function'?callbacks.pos:false),
                'neg':(typeof(callbacks)==='object' && typeof(callbacks.neg)==='function'?callbacks.neg:false)
            });
            // \\ manage callbacks argument

            if(typeof(optsIn.priority)!=='number' || Math.floor(parseFloat(optsIn.priority))<0){optsIn.priority=0;}
            else if(optsIn.priority>=Number.MAX_SAFE_INTEGER){optsIn.priority=Number.MAX_SAFE_INTEGER;}
            else if(typeof(optsIn.priority)==='number' && !isNaN(optsIn.priority)){optsIn.priority=Math.abs(Math.floor(optsIn.priority));}
            else{optsIn.priority=0;}
            optsIn.exclude_ids=self.list.all.concat( (optsIn.exclude_ids instanceof Array?optsIn.exclude_ids:[]) );
//console.log("[C0RE] NEW CORE! ",self.unique_prefix);
            optsIn.unique_prefix=(typeof(optsIn.unique_prefix)!=='undefined'?optsIn.unique_prefix:self.unique_prefix);

            var ouptut=false;
            if(self.tasker_type==='fuzzy'){
                if(typeof(callbacks.idle)==='function'){throw new Error("[c0re] When tasker type is set to '"+self.tasker_type+"'; 2nd arg must be object with key 'idle'.");}
                ouptut=new c0reModel(callbacks.pos,callbacks.neg,callbacks.do,callbacks.idle,optsIn);
            }else{
                ouptut=new c0reModel(callbacks.pos,callbacks.neg,callbacks.do,optsIn);
            }

            enqueue.apply(self,[ouptut]);
            return ouptut.unique_id;
        };
        c0re.prototype.remove=function(uniqueIdIn){//remove with unique_id or declared 'do' function
            var self=this,did_del=false;
throw new Error("[c0re] remove");
            if(typeof(uniqueIdIn)==='function'){
                for(var func in self.queue){if(utils.obj_valid_key(self.queue,func) && typeof(self.queue[func])==='function' && self.queue[func]===uniqueIdIn){delete self.queue[func];did_del=true;}}}
            else{
                for(var q in self.queue){if(utils.obj_valid_key(self.queue,q) && self.queue[q]===uniqueIdIn){delete self.queue[func];did_del=true;}}}
console.log("[c0re] REMOVE", (did_del?'TRUE':'FALSE'));
        	if(did_del){self.queue=utils.array_redex(self.queue);}
            else if(!self.silent){console.error("[c0re] Remove Identifier"+(typeof(uniqueIdIn)==='string'?" '"+uniqueIdIn+"'":'')+" not found.");}
            self.rebuild_info();
        };
        c0re.prototype.task_result=function(){
            var self=this,
                is_success=false,success_keys=[],fail_keys=[];
            for(var s=0;s<self.queue.length;s++){if(self.queue[s].is_success){success_keys.push(s);}else{fail_keys.push(s);}}


            if(self.determinative.toLowerCase()==='all'){
                if(success_keys.length>=self.queue.length){is_success=true;}
            }else if(self.determinative.toLowerCase()==='~all'){
                if(success_keys.length!==0){is_success=true;}
            }else if(self.determinative.toLowerCase()==='pos'){
                if(success_keys.length>fail_keys.length){is_success=true;}
            }

            self.hook_ins.icallback('task_result',{},function(nArgs){
                // events=nArgs.events;//debugVar=nArgs.debug;
            });
            if(is_success){self._SCOPE_.end_callbacks.success.apply(self);}
            else{self._SCOPE_.end_callbacks.fail.apply(self);}
        };
        c0re.prototype.execute=function(){
//console.log("[c0re] execute()");
            var self=this,
                order_priority=function(taskList,numArr){
                    var seek_keys=[],output=[];
                    numArr.forEach(function(v,i,arr){
                        var curr_num=v;
                        for(var t=0;t<taskList.length;t++){
                            if(taskList[t].is_executable && taskList[t].priority===curr_num){seek_keys.push(t);}
                            //if(!taskList[t].is_completed && taskList[t].priority===curr_num){seek_keys.push(t);}
                        }
                    });
                    seek_keys.forEach(function(v,i,arr){output.push(taskList[v]);});
                    return output;
                },
                large_loop_func=function(){
//console.log('[c0re execute]  ');//'[c0re execute] self._SCOPE_.info_obj',self._SCOPE_.info_obj
                    self.small_cycle.cancel_func();//keep recursion clean
                    var actual_pool=self._SCOPE_.info_obj.free_size(),
                        task_queue=[],
                        doing_queue=[],
                        priority_list=[],
                        key_list={'critical':[]},
                        currentqueue=self.queue.concat([]),currenttempqueue=self.temp_queue.concat([]);
                    for(var e=0;e<currentqueue.length;e++){
                        priority_list.push(Math.floor(currentqueue[e].priority));}
                    for(var e=0;e<currenttempqueue.length;e++){
                        priority_list.push(Math.floor(currenttempqueue[e].priority));}
                    priority_list=_.uniq(priority_list, true);//sorted and duplicates removed
//console.log("[c0re] priority_list ",priority_list);
                    if(currenttempqueue.length>0){//merge in temp queue first!
                        doing_queue=doing_queue.concat(order_priority(currenttempqueue, priority_list));}
//console.log("[c0re] doing_queue A (currentqueue.length: "+currenttempqueue.length+") ",doing_queue);
//console.log("[c0re] doing_queue A (currentqueue.length: "+currenttempqueue.length+") ");
                    if(currentqueue.length>0){//now the public queue
                        doing_queue=doing_queue.concat(order_priority(currentqueue, priority_list));}
//console.log("[c0re] doing_queue B (currentqueue.length: "+currentqueue.length+") ",doing_queue);
//console.log("[c0re] doing_queue B (currentqueue.length: "+currentqueue.length+") ");

                    task_queue=(doing_queue.length>actual_pool?doing_queue.slice(0,actual_pool):doing_queue.concat([]));
//console.log("[c0re] actual_pool: ",actual_pool,"\nself.unique_prefix: ",self.unique_prefix);
                    if(task_queue.length>0){
//console.log("[c0re] task_queue: ",task_queue[0],"\ntask_queue.unique_id: ",task_queue[0].unique_id,' - status ',task_queue[0].status);
                        if(task_queue.length>0){task_queue.forEach(function(task,i,arr){task.mark_next();});}
                        self.rebuild_info();
                    }
                    if(self._SCOPE_.info_obj.idlist.complete.length>=self.temp_queue.concat(self.queue).length){
//console.log("[c0re] DOING HALT!");
                        self.small_cycle.init_func(self.halt.bind(self));
                        //self.do_next();
                    }else{
//console.log("[c0re] DOING NEXT!");
                        self.small_cycle.init_func(self.do_next.bind(self));
                        //self.do_next();
                    }
//console.log("[c0re] LEN COMPARISION ",self._SCOPE_.info_obj.idlist.complete.length,' >= ',self.temp_queue.concat(self.queue).length);
//console.log("[c0re] ===================================================",self.temp_queue.concat(self.queue).length,"\n");
// xit();
                };
//console.log("[c0re] TEST: (false or num?) self.large_cycle.id: ",self.large_cycle.id);
            if(self.large_cycle.id!==false){throw new Error("[c0re] Could not execute. Large Thread is busy");return false;}

//console.log("[c0re] self.large_cycle.init_func()\n","self.queue: ",self.queue);
            self.large_cycle.init_func(large_loop_func);
        };
        c0re.prototype.halt=function(){
            var self=this;
//console.log("\n"+"[c0re] ========= halt =========",self.constructor.name);
            self.large_cycle.cancel_func();//all stop!
            self.small_cycle.cancel_func();
            if(self._SCOPE_.info_obj.idlist.complete.length>=self.temp_queue.concat(self.queue).length){//safe ending
                self.task_result();}
        };
        c0re.prototype.do_next=function(){
            var self=this,
                result_queue=[],
                full_queue=[];
            full_queue=self.temp_queue.concat(self.queue);
            if(full_queue.length===0){return;}
            for(var f=0;f<full_queue.length;f++){
                var task=full_queue[f];
                if(task.is_next){
                    result_queue.push(self.wrap_task(task, full_queue));
                }
            }
            result_queue.forEach(function(v,i,arr){
                var wrapped=v;
                if(typeof(wrapped)==='object'){//rather than false
                    wrapped.func();
                }
            });
//console.log("result_queue: ",result_queue);process.exit();
        };
        c0re.prototype.wrap_task=function(coreModelIn,fullQue){
            var self=this,
                actions={
                    'encap_pos':false, //actions.encap_pos() actions.encap_neg()
                    'encap_neg':false,
                    'encap_idle':false,
                    'encap_do':false
                },
                output={
                    '$segs':fullQue.concat([]),
                    '$self':coreModelIn,
                    '$scope':false,
                    '$data':coreModelIn.data,
                    'do':false,
                    'pos':false,
                    'neg':false,
                    'idle':false
                };

            if(coreModelIn.is_next){//}else if(coreModelIn.is_next){
                actions.encap_pos=function(){
                    if(!coreModelIn.is_completed){
//console.log("YUP! ",coreModelIn.is_completed,coreModelIn.status);
                        coreModelIn.mark_pos();
                        c0reModel.result_args=(arguments.length>0?arguments:[]);
                        //coreModelIn.action();
                        self.rebuild_info();
                        coreModelIn.tasks.pos.apply(self, c0reModel.result_args);}
                };
                actions.encap_neg=function(){
                    if(!coreModelIn.is_completed){
//console.log("NOPE! ",coreModelIn.is_completed,coreModelIn.status);process.exit();
                        coreModelIn.mark_neg();
                        c0reModel.result_args=(arguments.length>0?arguments:[]);
                        //coreModelIn.action();
                        self.rebuild_info();
                        coreModelIn.tasks.neg.apply(self, c0reModel.result_args);}
                };
                actions.encap_idle=function(){//WIP - should be more like a 'keep-alive' function (pinger)
                    if(coreModelIn.is_queued){
                        //coreModelIn.mark_busy();
                        //coreModelIn.action();
                        coreModelIn.tasks.idle.apply(self, [output]);}
                };
                actions.encap_do=function(){
                    coreModelIn.mark_busy();
                    //coreModelIn.action();
//console.log("coreModelIn.tasks: ",coreModelIn.tasks,"\n",'coreModelIn: ',coreModelIn);

                    return coreModelIn.tasks.do.apply(self, [output, actions.encap_pos, actions.encap_neg, actions.encap_idle]);
                };
                output.do=actions.encap_do;
                output.pos=actions.encap_pos;
                output.neg=actions.encap_neg;
                output.idle=actions.encap_idle;
                return {
                    'func':function(){
                        return actions.encap_do();
                    },
                    'schema':output
                };
            }
            return false;
        };
        c0re.prototype.xxxxxx=function(){
            var self=this;
        };

        }).apply(this);

    }
    c0re.prototype.rebuild_info=function(){
        var self=this;
        self._SCOPE_.info_obj.rebuild.apply(self);
    };
    return c0re;
}
