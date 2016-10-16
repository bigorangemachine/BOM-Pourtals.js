
module.exports = function(do_msg, do_err){
    var utils=require('bom-utils'),merge=require('merge'),_=require('underscore');
    return {
        'integrity':function(doNext){
// throw new Error("Expecting to finish these tests.  Should be able to change FPS/POOL_SIZE when appropriate and '1' when appropriate.  Include readonly");
            var c0re=require('../sub/c0re')(),
                default_fps=15,
                default_poolsize=1,
                taskschema={'events':[],'max':1,'inc':0,'completed':false},
                eventtaskschema={'didcatch':false,'type':false,'ident':false,'stamp':false},
                task_list={
                    'all':{
                        'info':merge(true,{},taskschema,{'max':0}),
                        'instance':false,
                        'is_completed':false,
                        'options':false
                    },
                    'core0':{
                        'info':merge(true,{},taskschema,{'max':4}),
                        'target_fps':default_fps,
                        'target_poolsize':default_poolsize,
                        'instance':false,
                        'is_completed':false,
                        'options':{'cycle_type':'iterator','tasker_type':'queue','fixed_fps':false}// Wheatley (iterator-queue) -> can't change pool size
                    },
                    'core1':{
                        'info':merge(true,{},taskschema,{'max':4}),
                        'target_fps':default_fps,
                        'target_poolsize':default_poolsize,
                        'instance':false,
                        'is_completed':false,
                        'options':{'cycle_type':'iterator','tasker_type':'pool','fixed_fps':false}// Paranoia  (iterator-pool)
                    },
                    'core2':{
                        'info':merge(true,{},taskschema,{'max':4}),
                        'target_fps':default_fps,
                        'target_poolsize':default_poolsize,
                        'instance':false,
                        'is_completed':false,
                        'options':{'cycle_type':'generator','tasker_type':'queue','fixed_fps':false}// Cake (generator-queue) -> can't change pool size
                    },
                    'core3':{
                        'info':merge(true,{},taskschema,{'max':4}),
                        'target_fps':default_fps,
                        'target_poolsize':default_poolsize,
                        'instance':false,
                        'is_completed':false,
                        'options':{'cycle_type':'generator','tasker_type':'pool','fixed_fps':false}// Anger (generator-pool)
                    },
                    'core4':{
                        'info':merge(true,{},taskschema,{'max':16}),
                        'target_fps':default_fps,
                        'target_poolsize':4,
                        'instance':false,
                        'is_completed':false,
                        'options':{'cycle_type':'iterator','tasker_type':'pool','pool_size':3,'fixed_fps':false}
                    },
                    'core5':{
                        'info':merge(true,{},taskschema,{'max':16}),
                        'target_fps':default_fps,
                        'target_poolsize':8,
                        'instance':false,
                        'is_completed':false,
                        'options':{'cycle_type':'iterator','tasker_type':'pool','pool_size':3,'fixed_fps':false}
                    }
                },
                finish_func=function(taskKey,typeIn){
                    return function(){
// console.log("finish_func=======",arguments);
// console.log("taskKey: ",taskKey);
// console.log("typeIn:",typeIn);
// console.log("\n=======");
                        if(typeof(taskKey)!=='undefined' && utils.obj_valid_key(task_list,taskKey)){
                            if(typeIn==='root'){//one large cycle is completed
                                //task_list[taskKey].instance.halt();//kill off the generators!
                                judge_func();
                            }else if(typeIn==='inc'){// incremental
//console.log("task_list['"+taskKey+"'].instance.large_cycle.history: ",task_list[taskKey].instance.large_cycle.history);
//process.exit();
                            }
                        }
                    };
                },
                judge_func=function(){//passed as final success function
                    var analysis_data={
                            'tasks':{
                                'populate_func':function(taskIn, popObj){
                                    return function(v,i,arr){
                                        if(v.type==='setcompleted'){
                                            popObj.complete++;
                                            analysis_data.events.complete.push(merge(true,{},v,{'task':taskIn}));//task_list[taskIn].info.events[i].type
                                        }else if(v.type==='taskcompleted'){
                                            popObj.taskcomplete++;
                                            analysis_data.events.taskcomplete.push(merge(true,{},v,{'task':taskIn}));
                                        }
                                    };
                                },
                                'core_count':0,
                                'inc':{ 'total':0, 'taskcomplete':0, 'complete':0 },
                                'all':{ 'total':0, 'taskcomplete':0, 'complete':0 }
                            },
                            'events':{
                                'taskcomplete':[],
                                'complete':[]
                            }
                        },
                        all_sml_history=[],
                        all_lrg_history=[];
                    for(var c0re_set in task_list){
                        if(!utils.obj_valid_key(task_list,c0re_set)){continue;}
                        if(c0re_set==='all'){
                            analysis_data.tasks.all.total+=task_list[c0re_set].info.events.length;
                            task_list[c0re_set].info.events.forEach(analysis_data.tasks.populate_func(c0re_set, analysis_data.tasks.all));
                        }else{
                            if(task_list[c0re_set].instance.large_cycle.use_history===false || task_list[c0re_set].instance.small_cycle.use_history===false){
                                throw new Error("[C0RE TEST] Dev has set to use history to false; for this test suite it is required that the history is set to true.");}

                            task_list[c0re_set].instance.small_cycle.history.forEach(function(v,i,arr){all_sml_history.push(v);});
                            task_list[c0re_set].instance.large_cycle.history.forEach(function(v,i,arr){all_lrg_history.push(v);});

                            analysis_data.tasks.core_count++;
                            analysis_data.tasks.inc.total+=task_list[c0re_set].info.events.length;
                            task_list[c0re_set].info.events.forEach(analysis_data.tasks.populate_func(c0re_set, analysis_data.tasks.inc));
                        }
                    }
//console.log("analysis_data.tasks.inc.complete>=analysis_data.tasks.core_count: ",analysis_data.tasks.inc.complete,' >= ',analysis_data.tasks.core_count)
                    if(!(analysis_data.tasks.inc.complete>=analysis_data.tasks.core_count)){return;}//are all c0re sets  done?

                    var history_compare=function(v,i,arr){
                            for(var a=0;a<arr.length;a++){
                                if(a!==i && v===arr[a]){throw new Error("[C0RE TEST] Cycle history ('"+i+"' vs '"+a+"') is not unique - possible scoping issue."+v);}}
                        },
                        events_compare=function(taskIn){
                            return function(v,i,arr){
console.log(v.inc,' !== ',v.max);
                                if(v.inc!==v.max){
                                    throw new Error("[C0RE TEST] Task '"+taskIn+"' execution count is mismatched; Expecting '"+v.max+"' got '"+v.inc+"'.");
                                }

                            };
                        };

                    do_msg("All tasks complete. Running data analysis.");
console.log("task_list.all.events: ",task_list.all.info.events.length,"\nanalysis_data.tasks",analysis_data.tasks);
                    do_msg("\t"+"Checking setTimeout/setImmediate/requestAnimationFrame/setInterval request ids");
                    all_sml_history.forEach(history_compare);
                    all_lrg_history.forEach(history_compare);

                    do_msg("\t"+"Counting & Comparing task completions - High Level");
                    if(!(analysis_data.tasks.core_count===analysis_data.tasks.all.complete)){//the number of index keys that start with 'c0re' match the number of 'set completions' (aka root completions)
                        throw new Error("[C0RE TEST] c0re 'set completion' rate out of sync.  Expecting '"+analysis_data.tasks.core_count+"' got '"+analysis_data.tasks.all.complete+"'.");
                    }
                    if(!(task_list.all.info.events.length===analysis_data.tasks.inc.total)){
                        throw new Error("[C0RE TEST] Task completion rate out of sync.  Expecting '"+task_list.all.info.events.length+"' got '"+analysis_data.tasks.inc.total+"'.");
                    }
                    do_msg("\t"+"Counting & Comparing task completions - Low Level");
                    for(var c0re_set in task_list){
                        if(!utils.obj_valid_key(task_list,c0re_set)){continue;}

                        if(task_list[c0re_set].info.max!==task_list[c0re_set].info.inc){//the enqueue binding went wrong?
                            throw new Error("[C0RE TEST] Task '"+c0re_set+"' enqueue count is mismatched; Expecting '"+task_list[c0re_set].info.max+"' got '"+task_list[c0re_set].info.inc+"'.");}

                        var task_execs=[],
                            append_task_exec=function(v,i,arr){
                                if(v.task===c0re_set){task_execs.push(v);}
                            };
                        if(c0re_set==='all'){
                            analysis_data.events.complete.forEach(append_task_exec);
                            analysis_data.events.taskcomplete.forEach(append_task_exec);
                        }else{
                            analysis_data.events.taskcomplete.forEach(append_task_exec);
                        }

//console.log(c0re_set,"\n",'task_execs ',task_execs,"\n",' analysis_data.events.taskcomplete ',analysis_data.events.taskcomplete,"\n",' analysis_data.events.complete ',analysis_data.events.complete);

                        if(task_list[c0re_set].info.inc!==task_execs.length){
                            throw new Error("[C0RE TEST] Task '"+c0re_set+"' execution count is mismatched; Expecting '"+task_list[c0re_set].info.inc+"' got '"+task_execs.length+"'.");
                        }
                        //analysis_data.events.taskcomplete.forEach(events_compare(c0re_set));
                        //analysis_data.tasks.inc.events_complete.forEach(events_compare(c0re_set));
                    }

process.exit();

//task_list.all.info.events - max against total
//if all done
// Wheatley (core0) - pool size is 1, fps is default



//Wheatley Tests
// change pool size
// change fps
                    doNext();
                },
                test_task_history_func=function(keyNum,typeIn){//passed as final success function
                    return function(){
// console.log("test_task_history_func( ");
// console.log("keyNum: '",keyNum,"' ");
// console.log("typeIn: '",typeIn,"'): ");
// console.log("ISROOT? ",(typeIn==='root'?'TRUE':'FALSE'));
                        var now_stamp=new Date();
                        if(typeIn==='root'){
                            task_list.all.info.inc++;
                            task_list.all.info.events.push(merge(true,{},eventtaskschema,{'type':'setcompleted', 'ident':keyNum, 'stamp':now_stamp}));
                            task_list['core'+keyNum].is_completed=true;
                            task_list['core'+keyNum].info.events.push(merge(true,{},eventtaskschema,{'type':'setcompleted', 'ident':keyNum, 'stamp':now_stamp}));
                            finish_func('core'+keyNum,'root')();
                        }else if(typeIn==='inc'){// incremental
                            task_list.all.info.inc++;
                            task_list.all.info.events.push(merge(true,{},eventtaskschema,{'type':'taskcompleted', 'ident':keyNum, 'stamp':now_stamp}));
                            task_list['core'+keyNum].info.events.push(merge(true,{},eventtaskschema,{'type':'taskcompleted', 'ident':keyNum, 'stamp':now_stamp}));
                        }
                    };
                };

            try{
                var inc=0,
                    timed_delay=333;
                for(var k in task_list){
                    if(!utils.obj_valid_key(task_list,k) || k==='all'){continue;}
                    (function(index,task){
                        var enque_func=function(pkg,pos,neg){
                                var thetimeoutid=setTimeout(function(){//simulate async thing
                                        clearTimeout(thetimeoutid);//clean the threads!

                                        task_list[task].info.inc++;//increment the completions
                                        test_task_history_func(index,'inc')();

                                        try{pos();}
                                        catch(eInner){throw new Error("[C0RE TEST] Could not 'POS FUNC' for : "+index+" - task: "+task+".\n"+eInner.toString());}
                                    }, timed_delay);
                            };

                        task_list[task].instance=new c0re(test_task_history_func(index,'root'), merge(true,{},task_list[task].options,{'silent':false}));
                        task_list.all.info.max++;//increment for c0re set
                        var change_fps=function(taskIn,inc){
                                do_msg("Task '"+taskIn+"'-#"+inc+":  altering the 'fps' from "+task_list[taskIn].instance.fps+" to "+task_list[taskIn].target_fps+"");
                                task_list[taskIn].instance.enqueue(function(pkg,pos,neg){
                                    task_list[taskIn].instance.fps=task_list[taskIn].target_fps;
                                    enque_func(pkg,pos,neg);
                                }, finish_func(taskIn,'inc'));
                            },
                            change_pool=function(taskIn,inc){
                                do_msg("Task '"+taskIn+"'-#"+t+":  altering the 'poolsize' from "+task_list[taskIn].instance.pool_size+" to "+task_list[taskIn].target_poolsize+"");
                                task_list[taskIn].instance.enqueue(function(pkg,pos,neg){
                                    task_list[taskIn].instance.set_pool(task_list[taskIn].target_poolsize);
                                    enque_func(pkg,pos,neg);
                                }, finish_func(taskIn,'inc'));
                            };
                        for(var t=1;t<=task_list[task].info.max;t++){
                            if(task=='core4' && (t===2 || t===4)){
                                if(t===2){//2nd test change the pool size
                                    change_pool(task,t);
                                }else if(t===4){
                                    change_fps(task,t);
                                }
                            }else if(task=='core5' && (t===2 || t===4)){
                                if(t===4){
                                    change_pool(task,t);
                                }else if(t===2){
                                    change_fps(task,t);
                                }
                            }else{
                                if(t===3 && task!=='core4' && task!=='core5'){
                                    change_fps(task,t);
                                }else{//dummy enqueue
                                    task_list[task].instance.enqueue(enque_func, finish_func(task,'inc'));
                                }
                            }
                            task_list.all.info.max++;//increment for enqueue
                        }
                    })(inc,k);
                    inc++;
                }

                for(var k in task_list){
                    if(utils.obj_valid_key(task_list,k) && k!=='all'){
                        task_list[k].instance.execute();
                    }
                }
            }catch(e){
                throw new Error("[C0RE TEST] Could not initalize test 'integrity'\n"+e.toString());
                doNext();
            }
        },
        'typical':function(doNext){
            var event_history=[],
                event_history_expected=[
                    'init_priority_first_1','init_priority_first_2_async','init_priority_last_1','start_1','exit_1_async','exit_2_async'
                ],
                schema_keys=utils.array_keys({
                    '$segs':null,
                    '$self':null,
                    '$scope':null,
                    '$data':null,
                    'do':null,
                    'pos':null,
                    'neg':null,
                    'idle':null
                }).sort(),
                c0redP=require('../index')(),
                rootThread=new c0redP(function(){
                    event_history.forEach(function(v,i,arr){
                        if(v.testkey!==event_history_expected[i]){throw new Error("[C0REDP TEST] Invalid Order execution. Expecting '"+event_history_expected.join(', ')+"' recieved '"+v.testkey+"'. ");}
                        v.event;
                        v.pkg_keys.sort().forEach(function(val,index,arrinner){
                            if(val!==schema_keys[index]){throw new Error("[C0REDP TEST] Invalid package schema in test '"+val+"' execution. Expecting '"+schema_keys.join(', ')+"'. ");}
                        });
                    });
                    doNext();
                });

            // INIT CALLBACKS!
            rootThread.on('init',function(pkg,flagPosFunc,flagNegFunc){
                event_history.push({'event':'init','pkg_keys':utils.array_keys(pkg), 'testkey': 'init_priority_first_1'});
                flagPosFunc();
            });
            rootThread.on('init',function(pkg,flagPosFunc,flagNegFunc){
                event_history.push({'event':'init','pkg_keys':utils.array_keys(pkg), 'testkey': 'init_priority_first_2_async'});
                return setTimeout(function(){
                    return flagPosFunc.apply(null,utils.convert_args(arguments));
                },1500);
            });
            rootThread.on('init',function(pkg,flagPosFunc,flagNegFunc){
                event_history.push({'event':'init','pkg_keys':utils.array_keys(pkg), 'testkey': 'init_priority_last_1'});
                flagPosFunc();//flagNegFunc();
            },{'priority':9000});
            // \\ INIT CALLBACKS!

            rootThread.on('start',function(pkg,flagPosFunc,flagNegFunc){
                event_history.push({'event':'start','pkg_keys':utils.array_keys(pkg), 'testkey': 'start_1'});
                flagPosFunc();
            });
            //},{'priority':9000});


            // EXIT CALLBACKS!
            rootThread.on('exit',function(pkg,flagPosFunc,flagNegFunc){
                event_history.push({'event':'exit','pkg_keys':utils.array_keys(pkg), 'testkey': 'exit_1_async'});
                return setTimeout(function(){
                    return flagPosFunc.apply(null,utils.convert_args(arguments));
                },1500);
            },{'priority':9000});

            rootThread.on('exit',function(pkg,flagPosFunc,flagNegFunc){
                event_history.push({'event':'exit','pkg_keys':utils.array_keys(pkg), 'testkey': 'exit_2_async'});
                flagPosFunc();
            },{'priority':1});
            // \\ EXIT CALLBACKS!


            rootThread.do_init();

        }
    };
};
