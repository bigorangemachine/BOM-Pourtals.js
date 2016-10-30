
module.exports = function(do_msg, do_err){
    var utils=require('bom-utils'),merge=require('merge'),_=require('underscore');
    return {
        'integrity':function(doNext){
// throw new Error("Expecting to finish these tests.  Should be able to change FPS/POOL_SIZE when appropriate and '1' when appropriate.  Include readonly");
            var c0re=require('../sub/c0re')(),
                timed_delay=333,
                default_fps=15,
                base_change_fps=60,
                default_poolsize=1,
                base_change_poolsize=2,
                taskschema={'events':[],'max':1,'inc':0,'started_inc':0,'completed':false},
                eventtaskschema={'didcatch':false,'type':false,'ident':false,'stamp':false},
                // review fixed_poolsize and fixed_fps settings.  originally there was confusion on fps vs poolsize.
                // FPS isn't changed in the activation loop so setting 'fixed_fps' in options is wrong(?)
                // Just review the code for 100% coverage
                task_list={
                    'all':{
                        'name': 'All history',
                        'info':merge(true,{},taskschema,{'max':0}),
                        'instance':false,
                        'is_completed':false,
                        'options':false
                    },
                    'core0':{
                        'name': 'Wheatley (iterator-queue)',
                        'info':merge(true,{},taskschema,{'max':4}),
                        'target_fps':base_change_fps,
                        'target_poolsize':base_change_poolsize,
                        'instance':false,
                        'is_completed':false,
                        'options':{'cycle_type':'iterator','tasker_type':'queue','fixed_fps':true}// Wheatley (iterator-queue) -> can't change pool size
                    },
                    'core1':{
                        'name': 'Paranoia  (iterator-pool)',
                        'info':merge(true,{},taskschema,{'max':4}),
                        'target_fps':base_change_fps,
                        'target_poolsize':base_change_poolsize,
                        'instance':false,
                        'is_completed':false,
                        'options':{'cycle_type':'iterator','tasker_type':'pool','fixed_fps':true}// Paranoia  (iterator-pool)
                    },
                    'core2':{
                        'name': 'Cake (generator-queue)',
                        'info':merge(true,{},taskschema,{'max':4}),
                        'target_fps':base_change_fps,
                        'target_poolsize':base_change_poolsize,
                        'instance':false,
                        'is_completed':false,
                        'options':{'cycle_type':'generator','tasker_type':'queue','fixed_fps':true}// Cake (generator-queue) -> can't change pool size
                    },
                    'core3':{
                        'name': 'Anger (generator-pool)',
                        'info':merge(true,{},taskschema,{'max':4}),
                        'target_fps':base_change_fps,
                        'target_poolsize':base_change_poolsize,
                        'instance':false,
                        'is_completed':false,
                        'options':{'cycle_type':'generator','tasker_type':'pool','fixed_fps':false}// Anger (generator-pool)
                    },
                    'core4':{
                        'name': 'Paranoia (iterator-pool) Modified Pool then FPS',
                        'info':merge(true,{},taskschema,{'max':16}),
                        'target_fps':base_change_fps,
                        'target_poolsize':4,
                        'instance':false,
                        'is_completed':false,
                        'options':{'cycle_type':'iterator','tasker_type':'pool','pool_size':3,'fixed_fps':false}
                    },
                    'core5':{
                        'name': 'Paranoia (iterator-pool) Modified FPS then Pool',
                        'info':merge(true,{},taskschema,{'max':16}),
                        'target_fps':base_change_fps,
                        'target_poolsize':8,
                        'instance':false,
                        'is_completed':false,
                        'options':{'cycle_type':'iterator','tasker_type':'pool','pool_size':3,'fixed_fps':false}
                    }
                },
                finish_func=function(taskKey,typeIn){
                    return function(){
                        if(typeof(taskKey)!=='undefined' && utils.obj_valid_key(task_list,taskKey)){
                            if(typeIn==='root'){//one large cycle is completed
                                task_list[taskKey].instance.halt();//kill off the generators!
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
                                        }else if(v.type==='taskstarted'){
                                            popObj.start++;
                                            analysis_data.events.taskstarted.push(merge(true,{},v,{'task':taskIn}));
                                        }
                                    };
                                },
                                'core_count':0,
                                'inc':{ 'total':0, 'taskcomplete':0, 'complete':0, 'start':0 },
                                'all':{ 'total':0, 'taskcomplete':0, 'complete':0, 'start':0 }
                            },
                            'events':{
                                'taskstarted':[],
                                'taskcomplete':[],
                                'complete':[]
                            }
                        },
                        all_sml_history=[],
                        all_lrg_history=[];
                    for(var c0re_set in task_list){
                        if(!utils.obj_valid_key(task_list,c0re_set)){continue;}
                        var task_started_count=0;
                        task_list[c0re_set].info.events.forEach(function(v,i,arr){if(v.type==='taskstarted'){task_started_count++;}});

                        if(c0re_set==='all'){
                            analysis_data.tasks.all.total+=task_list[c0re_set].info.events.length-task_started_count;
                            task_list[c0re_set].info.events.forEach(analysis_data.tasks.populate_func(c0re_set, analysis_data.tasks.all));
                        }else{
                            if(task_list[c0re_set].instance.large_cycle.use_history===false || task_list[c0re_set].instance.small_cycle.use_history===false){
                                throw new Error("[C0RE TEST] Dev has set to use history to false; for this test suite it is required that the history is set to true.");}

                            task_list[c0re_set].instance.small_cycle.history.forEach(function(v,i,arr){all_sml_history.push(v);});
                            task_list[c0re_set].instance.large_cycle.history.forEach(function(v,i,arr){all_lrg_history.push(v);});

                            analysis_data.tasks.core_count++;
                            task_list[c0re_set].info.events.forEach(function(v,i,arr){
                                if(v.type==='taskcompleted'){analysis_data.tasks.inc.total++;}
                            });
                            analysis_data.tasks.inc.total+=task_list[c0re_set].info.events.length-task_started_count;
                            task_list[c0re_set].info.events.forEach(analysis_data.tasks.populate_func(c0re_set, analysis_data.tasks.inc));
                        }
                    }
//console.log("analysis_data.tasks.inc.complete>=analysis_data.tasks.core_count: ",analysis_data.tasks.inc.complete,' >= ',analysis_data.tasks.core_count)
                    if(!(analysis_data.tasks.inc.complete>=analysis_data.tasks.core_count)){return;}//are all c0re sets  done?

                    var history_compare=function(v,i,arr){
                            for(var a=0;a<arr.length;a++){
                                if(a!==i && v===arr[a]){throw new Error("[C0RE TEST] Cycle history ('"+i+"' vs '"+a+"') is not unique - possible scoping issue."+v);}}
                        };

                    do_msg("All tasks complete. Running data analysis.");
                    do_msg("\t"+"Checking setTimeout/setImmediate/requestAnimationFrame/setInterval request ids");
                    all_sml_history.forEach(history_compare);
                    all_lrg_history.forEach(history_compare);

                    do_msg("\t"+"Counting & Comparing task completions - High Level");
                    if(!(analysis_data.tasks.core_count===analysis_data.tasks.all.complete)){//the number of index keys that start with 'c0re' match the number of 'set completions' (aka root completions)
                        throw new Error("[C0RE TEST] c0re 'set completion' rate out of sync.  Expecting '"+analysis_data.tasks.core_count+"' got '"+analysis_data.tasks.all.complete+"'.");
                    }
                    if(!(task_list.all.info.events.length===analysis_data.tasks.inc.total)){
                        throw new Error("[C0RE TEST] Task completion rate out of sync.  Expecting '"+task_list.all.info.events.length+"' got '"+analysis_data.tasks.inc.total+"'.");}

                    do_msg("\t"+"Counting & Comparing task completions - Low Level");
                    for(var c0re_set in task_list){
                        if(!utils.obj_valid_key(task_list,c0re_set)){continue;}

                        //do_msg("\t\t"+"Counting & Comparing task completion ["+c0re_set+"] - Low Level");
                        if(task_list[c0re_set].info.max!==task_list[c0re_set].info.inc){//the enqueue binding went wrong?
                            throw new Error("[C0RE TEST] Task '"+c0re_set+"' enqueue count is mismatched; Expecting '"+task_list[c0re_set].info.max+"' got '"+task_list[c0re_set].info.inc+"'.");}

                        var expected_max=0,
                            task_execs=[],
                            append_task_exec=function(v,i,arr){
                                if(v.task===c0re_set){
//if(c0re_set==='all'){console.log(v.type);}
                                    task_execs.push(v);}
                            };

                        var task_started_count=0;
                        //task_list[c0re_set].info.events.forEach(function(v,i,arr){if(v.type==='taskstarted'){task_started_count++;}});


                        if(c0re_set==='all'){
console.log("analysis_data.tasks.all.start: ",analysis_data.tasks.all.start);
                            expected_max+=task_list.all.info.max;//-analysis_data.tasks.all.start
                            analysis_data.events.complete.forEach(append_task_exec);
                            analysis_data.events.taskcomplete.forEach(append_task_exec);
                            analysis_data.events.taskstarted.forEach(append_task_exec);
                        }else{
                            expected_max+=task_list[c0re_set].info.max;
                            analysis_data.events.taskcomplete.forEach(append_task_exec);
                        }
//console.log(c0re_set,"\n",'task_execs ',task_execs,"\n",' analysis_data.events.taskcomplete ',analysis_data.events.taskcomplete,"\n",' analysis_data.events.complete ',analysis_data.events.complete);

                        if(task_list[c0re_set].info.inc!==task_execs.length){
                            throw new Error("[C0RE TEST] Task '"+c0re_set+"' execution count is mismatched; Expecting '"+task_list[c0re_set].info.inc+"' got '"+task_execs.length+"'.");
                        }
                        if(task_execs.length!==expected_max){
                            throw new Error("[C0RE TEST] Task '"+c0re_set+"' execution max is mismatched; Expecting '"+expected_max+"' got '"+task_execs.length+"'.");
                        }
                    }

                    do_msg("\t"+"Verifying Order of events");
                    var analysis_task_events={},
                        analysis_completed_events={},
                        list_events={},
                        events_compare=function(taskIn,typeIn){
                            if(typeIn==='list'){
                                var date_order=[],
                                    date_started_order=[],
                                    completed_tasks=[],
                                    started_tasks=[];
                                task_list[taskIn].info.events.forEach(function(v,i,arr){
                                    if(v.type==='taskcompleted'){date_order.push(v.stamp.getTime());}
                                    else if(v.type==='setcompleted'){completed_tasks.push(v);}
                                    else if(v.type==='taskstarted'){date_started_order.push(v.stamp.getTime());}
                                });

                                if(completed_tasks.length!==1){//this is redundant due to high level
                                    throw new Error("[C0RE TEST] Running test '"+taskIn+"' completion count. \n"+
                                        "This task has more than 1 completed calls; got "+completed_tasks.length+" completed calls.");
                                }

                                //strict date order completion check
                                if(task_list[taskIn].instance.tasker_type==='queue'){
                                // if(taskIn==='core0' || taskIn==='core2'){//all tests should complete in a strict order - Wheatley (iterator-queue) & Cake (generator-queue)
                                    var date_order_sorted=(date_order.concat([])).sort();//bracketed to guarntee order of operations
                                    for(var d=0;d<date_order_sorted.length;d++){
                                        if(date_order[d]!==date_order_sorted[d]){
                                            throw new Error("[C0RE TEST] Running test '"+taskIn+"' "+
                                                "(tasker type '"+task_list[taskIn].instance.tasker_type+"') completion order. \n"+
                                                "This task completed at '"+date_order+"' "+
                                                "but the matching index completed at '"+date_order_sorted[d]+"'.");
                                        }
                                    }
                                }
                                if(task_list[taskIn].instance.tasker_type==='pool'){
                                }
                                if(taskIn!=='all'){
// var date_diffs=[];
// for(var a=0;a<date_order.length;a++){date_diffs.push(date_order[a]-date_started_order[a]);}
// console.log("date_order: ",date_order,"\ndate_started_order: ",date_started_order,"\ndate_diffs: ",date_diffs);
                                    //var date_order_sorted=(date_order.concat([])).sort();//bracketed to guarntee order of operations
                                    for(var d=0;d<date_order.length;d++){
                                        // date ended (largest date as number) - date started (smallest date as number) / timeout_delay
                                        var percent_diff=(date_order[ d ] - date_started_order[d] )/timed_delay,
                                            fail_tolerance=0.15;// 15% failure tolerance
                                        //fail_tolerance=0.02;// 2% failure tolerance
                                        percent_diff=Math.abs(1-percent_diff);//its expected to take longer... or sorter... just reduce the difference

                                        if(percent_diff>fail_tolerance){
                                            throw new Error("[C0RE TEST] Running test '"+taskIn+"["+d+"]' completion order. \n"+
                                                "This task completed difference percent '"+(percent_diff*100)+"%'; "+
                                                "raw difference is '"+(date_order[ d ] - date_started_order[d])+"' "+
                                                "which is outside tollerance '"+(fail_tolerance*100)+"%'.");
                                        }

                                    }
                                }
                                //function validate_settings(){}
                                var has_unchanged_fps=function(taskKey){return (task_list[taskKey].instance.fps===default_fps?true:false);},
                                    has_unchanged_poolsize=function(taskKey){return (task_list[taskKey].instance.pool_size===default_poolsize?true:false);},
                                    has_changed_fps=function(taskKey,fpsIn){return (task_list[taskKey].instance.pool_size===fpsIn?true:false);},
                                    has_changed_poolsize=function(taskKey,poolSizeIn){return (task_list[taskKey].instance.pool_size===poolSizeIn?true:false);};
console.log(
"instance.fps: ",task_list[taskIn].instance.fps,"\n"+
"instance.pool_size: ",task_list[taskIn].instance.pool_size,"\n"+
"target_fps: ",task_list[taskIn].target_fps,"\n"+
"target_poolsize: ",task_list[taskIn].target_poolsize,"\n"+
"=============\n"+
"default_fps: ",default_fps,"\n"+
"default_poolsize: ",default_poolsize,"\n"+

"base_change_fps: ",base_change_fps,"\n"+
"base_change_poolsize: ",base_change_poolsize,"\n\n");
                                if(taskIn==='core0' || taskIn==='core1' || taskIn==='core2' || taskIn==='core3'){//fps cannot change
                                    if(!has_unchanged_fps(taskIn)){
                                        throw new Error("[C0RE TEST] Running test '"+taskIn+"' FPS (frames per second) comparision. \n"+
                                            "This has an FPS of '"+task_list[taskIn].instance.fps+"' expecting '"+default_fps+"' FPS. "+
                                            "Fixed FPS: "+(task_list[taskIn].instance.fixed_fps?'fixed':'non-fixed')+".");
                                    }
                                }
                                if(taskIn==='core0' || taskIn==='core2'){//pool size cannot change - 'queue' types
                                    if(!has_unchanged_poolsize(taskIn)){
                                        throw new Error("[C0RE TEST] Running test '"+taskIn+"' pool size comparision. \n"+
                                            "This has an FPS of '"+task_list[taskIn].instance.pool_size+"' expecting '"+default_poolsize+"' FPS. "+
                                            "Fixed Pool size: "+(task_list[taskIn].instance.fixed_pool?'fixed':'non-fixed')+".");
                                    }
                                }

                                if(taskIn==='core1' || taskIn==='core3'){//pool size can be changed
                                    if(!has_changed_poolsize(taskIn, task_list[taskIn].target_poolsize)){
                                        throw new Error("[C0RE TEST] Running test '"+taskIn+"' pool size comparision. \n"+
                                            "This has an pool size of '"+task_list[taskIn].instance.pool_size+"' expecting '"+task_list[taskIn].target_poolsize+"'. "+
                                            "Fixed Pool size: "+(task_list[taskIn].instance.fixed_pool?'fixed':'non-fixed')+".");
                                    }
                                }
                                if(taskIn==='core3'){
                                    throw new Error("WIP!");
                                }

                            }
// analysis_events
// list_events
                        },
                        events_build=function(taskIn,typeIn,logArr){
                            return function(v,i,arr){
                                if(typeIn==='analysis'){
                                    logArr.push(v);
                                }else if(typeIn==='list'){
                                    logArr.push(v);
                                }
                                // if(v.inc!==v.max){
                                //     throw new Error("[C0RE TEST] Task '"+taskIn+"' execution count is mismatched; Expecting '"+v.max+"' got '"+v.inc+"'.");
                                // }

                            };
                        };
//events_compare('core0', 'list');process.exit();
//events_compare('core1', 'list');process.exit();
events_compare('core0', 'list');events_compare('core1', 'list');events_compare('core2', 'list');
//events_compare('core2', 'list');process.exit();
events_compare('core3', 'list');process.exit();
                    for(var c0re_set in task_list){
                        if(!utils.obj_valid_key(task_list,c0re_set)){continue;}

                        // if(!analysis_task_events[c0re_set]){analysis_task_events[c0re_set]=[];}
                        // if(!analysis_completed_events[c0re_set]){analysis_completed_events[c0re_set]=[];}
                        // analysis_data.events.taskcomplete.forEach(events_build(c0re_set, 'analysis', analysis_task_events[c0re_set]));
                        // analysis_data.tasks.inc.events_complete.forEach(events_build(c0re_set, 'analysis', analysis_completed_events[c0re_set]));

                        if(!list_events[c0re_set]){list_events[c0re_set]=[];}
                        events_compare(c0re_set, 'list');
                        // task_list[c0re_set].info.events.forEach(events_build(c0re_set, 'list', list_events[c0re_set]));
                        // task_list[c0re_set].info.events.forEach(events_build(c0re_set, 'list', list_events[c0re_set]));
                    }

process.exit();
                    for(var c0re_set in task_list){
                        if(!utils.obj_valid_key(task_list,c0re_set)){continue;}
                        events_compare(c0re_set, 'list');
                    }
//if all done
// Wheatley (core0) - pool size is 1, fps is default



//Wheatley Tests
// change pool size
// change fps
                    doNext();
                },
                test_task_history_func=function(keyNum,typeIn){//passed as final c0re success function
                    return function(){
                        var now_stamp=new Date();
                        if(typeIn==='root'){
//console.log("\ttask: ",'core'+keyNum," typeIn: ",typeIn," task_list['core'+keyNum].instance.cycle_type: ",task_list['core'+keyNum].instance.cycle_type);
                            task_list.all.info.inc++;
                            task_list.all.info.events.push(merge(true,{},eventtaskschema,{'type':'setcompleted', 'ident':keyNum, 'stamp':now_stamp}));
                            task_list['core'+keyNum].is_completed=true;
                            task_list['core'+keyNum].info.events.push(merge(true,{},eventtaskschema,{'type':'setcompleted', 'ident':keyNum, 'stamp':now_stamp}));
                            finish_func('core'+keyNum,'root')();
                        }else if(typeIn==='inc'){// incremental
                            task_list.all.info.inc++;
                            task_list.all.info.events.push(merge(true,{},eventtaskschema,{'type':'taskcompleted', 'ident':keyNum, 'stamp':now_stamp}));
                            task_list['core'+keyNum].info.events.push(merge(true,{},eventtaskschema,{'type':'taskcompleted', 'ident':keyNum, 'stamp':now_stamp}));
                        }else if(typeIn==='start'){// start
                            task_list.all.info.inc++;
                            task_list.all.info.events.push(merge(true,{},eventtaskschema,{'type':'taskstarted', 'ident':keyNum, 'stamp':now_stamp}));
                            task_list['core'+keyNum].info.events.push(merge(true,{},eventtaskschema,{'type':'taskstarted', 'ident':keyNum, 'stamp':now_stamp}));
                        }
                    };
                };

            try{
                var inc=0;
                for(var k in task_list){
                    if(!utils.obj_valid_key(task_list,k) || k==='all'){continue;}
                    (function(index,task){
                        var enque_func=function(pkg,pos,neg){
                                task_list.all.info.max++;//increment for 'started'
                                task_list[task].info.started_inc++;
                                test_task_history_func(index,'start')();

                                var thetimeoutid=setTimeout(function(){//simulate async thing
                                        clearTimeout(thetimeoutid);//clean the threads!

                                        task_list[task].info.inc++;//increment the completions
                                        test_task_history_func(index,'inc')();//would have binded ^_^

                                        try{pos();}
                                        catch(eInner){throw new Error("[C0RE TEST] Could not 'POS FUNC' for : "+index+" - task: "+task+".\n"+eInner.toString());}
                                    }, timed_delay);
                            };

                        task_list[task].instance=new c0re(test_task_history_func(index,'root'), merge(true,{},task_list[task].options,{'silent':false,'fps':default_fps}));
                        task_list.all.info.max++;//increment for c0re set

                        var normal_enque=function(taskIn,numIn){
                                task_list[taskIn].instance.enqueue(enque_func, finish_func(taskIn,'inc'));
                            },
                            change_fps=function(taskIn,numIn){
                                do_msg("Task '"+taskIn+"'-#"+numIn+":  altering the 'fps' from "+task_list[taskIn].instance.fps+" to "+task_list[taskIn].target_fps+"");
                                task_list[taskIn].instance.enqueue(function(pkg,pos,neg){
                                    task_list[taskIn].instance.fps=task_list[taskIn].target_fps;
                                    enque_func(pkg,pos,neg);
                                }, finish_func(taskIn,'inc'));
                            },
                            change_pool=function(taskIn,numIn){
                                do_msg("Task '"+taskIn+"'-#"+numIn+":  altering the 'poolsize' from "+task_list[taskIn].instance.pool_size+" to "+task_list[taskIn].target_poolsize+"");
                                task_list[taskIn].instance.enqueue(function(pkg,pos,neg){
                                    task_list[taskIn].instance.set_pool(task_list[taskIn].target_poolsize);
                                    enque_func(pkg,pos,neg);
                                }, finish_func(taskIn,'inc'));
                            };
                        for(var t=1;t<=task_list[task].info.max;t++){
                            if(task=='core4' && t===2){//2nd task - change pool
                                change_pool(task,t);}
                            else if(task=='core4' && t===4){//4th task - change fps
                                change_fps(task,t);}
                            else if(task=='core5' && t===4){//4th task - change pool
                                change_pool(task,t);}
                            else if(task=='core5' && t===2){//2nd task - change fps
                                change_fps(task,t);}
                            else if(t===3 && task!=='core4' && task!=='core5'){//non special case - 3rd task - change pool
                                change_pool(task,t);}
                            else{//dummy enqueue
                                normal_enque(task,t);}
                            task_list.all.info.max++;//increment for enqueue
                        }
                    })(inc,k);
                    inc++;
                }
                //execute all at once!
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
