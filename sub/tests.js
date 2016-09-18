
module.exports = function(){
    var utils=require('bom-utils'),merge=require('merge'),_=require('underscore');
    return {
        'typical':function(doNext){
            var event_history=[],
                event_history_expected=[
                    'init_priority_first_1','init_priority_first_2_async','init_priority_last_1','start_1','exit_1_async','exit_2_async'
                ],
                schema_keys=utils.array_keys({
                    '$seg':null,
                    '$self':null,
                    '$scope':null,
                    '$data':null,
                    'do':null,
                    'pos':null,
                    'neg':null,
                    'idle':null
                }).sort(),
                c0redP=require('../../c0redP')(),
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
