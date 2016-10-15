
module.exports = function(do_msg, do_err){
    var utils=require('bom-utils'),merge=require('merge'),_=require('underscore');
    return {
        'integrity':function(doNext){
            throw new Error("Expecting to finish these tests.  Should be able to change FPS/POOL_SIZE when appropriate and '1' when appropriate.  Include readonly");
            var default_fps=15,
                default_poolsize=1,
                taskschema={'events':[],'max':1,'inc':0,'completed':false},
                eventtaskschema={'didcatch':false,'type':false,'ident':false,'stamp':false},
                task_list={
                    'all':{
                        'info':merge(true,{},taskschema),
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
                        'options':{'cycle_type':'iterator','tasker_type':'queue'}// Wheatley (iterator-queue) -> can't change pool size
                    },
                    'core1':{
                        'info':merge(true,{},taskschema,{'max':4}),
                        'target_fps':default_fps,
                        'target_poolsize':default_poolsize,
                        'instance':false,
                        'is_completed':false,
                        'options':{'cycle_type':'iterator','tasker_type':'pool'}// Paranoia  (iterator-pool)
                    },
                    'core2':{
                        'info':merge(true,{},taskschema,{'max':4}),
                        'target_fps':default_fps,
                        'target_poolsize':default_poolsize,
                        'instance':false,
                        'is_completed':false,
                        'options':{'cycle_type':'generator','tasker_type':'queue'}// Cake (generator-queue) -> can't change pool size
                    },
                    'core3':{
                        'info':merge(true,{},taskschema,{'max':4}),
                        'target_fps':default_fps,
                        'target_poolsize':default_poolsize,
                        'instance':false,
                        'is_completed':false,
                        'options':{'cycle_type':'generator','tasker_type':'pool'}// Anger (generator-pool)
                    },
                    'core4':{
                        'info':merge(true,{},taskschema,{'max':16}),
                        'target_fps':default_fps,
                        'target_poolsize':4,
                        'instance':false,
                        'is_completed':false,
                        'options':{'cycle_type':'iterator','tasker_type':'pool','pool_size':3}
                    },
                    'core5':{
                        'info':merge(true,{},taskschema,{'max':16}),
                        'target_fps':default_fps,
                        'target_poolsize':8,
                        'instance':false,
                        'is_completed':false,
                        'options':{'cycle_type':'iterator','tasker_type':'pool','pool_size':3}
                    }
                },
                judge_func=function(){//passed as final success function
                    //task_list.all.events - max against total
                        //if all done
                            // Wheatley (core0) - pool size is 1, fps is default



//Wheatley Tests
// change pool size
// change fps
                        doNext();
                },
                comp_func=function(keyNum,typeIn){//passed as final success function
                    return function(){
                        if(typeIn==='root'){
                            task_list.all.info.events.push(merge(true,{},eventtaskschema,{'type':'setcompleted', 'ident':keyNum, 'stamp':new Date()}));
                            task_list['core'+keyNum].is_completed=true;
                            task_list['core'+keyNum].info.events.push(merge(true,{},eventtaskschema,{'type':'setcompleted', 'ident':keyNum, 'stamp':new Date()}));
                        }else if(typeIn==='inc'){// incremental
                            task_list.all.info.events.push(merge(true,{},eventtaskschema,{'type':'setcompleted', 'ident':keyNum, 'stamp':new Date()}));
                            task_list['core'+keyNum].info.events.push(merge(true,{},eventtaskschema,{'type':'taskcompleted', 'ident':keyNum, 'stamp':new Date()}));
                        }

                    };
                };

            try{
                var inc=0;
                for(var k in task_list){
                    if(utils.obj_valid_key(task_list,k)){
                        (function(index,task){
                            var enque_func=function(pkg,pos,neg){
                                    comp_func(index,'inc');
                                    try{pos();}
                                    catch(eInner){throw new Error("[C0RE TEST] Could not enqueue index: "+index+" - task: "+task+" - POS() \n"+eInner.toString());}
                                };
                            task_list[task].instance=new c0re(comp_func(index,'root'), task_list[task].options);
                            for(var t=0;t<task_list.[task].info.max;t++){
                                if(task=='xxxxx'){}
                                else if(task=='xxxxx'){}
                                else{
                                    task_list[task].instance.enqueue(enque_func, judge_func);}

                            }
                            //task_list.[task].info.max++;
                            task_list.all.info.max++;

                        })(inc,k);
                        inc++;
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
