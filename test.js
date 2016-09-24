//modules
var _ = require('underscore'),//http://underscorejs.org/
    merge = require('merge'),//allows deep merge of objects
    utils = require('bom-utils'),
    vars = require('bom-utils/vars');
//custom modules - for WIP
// var utils = require('./jspkg/utils'),
//     vars = require('./jspkg/vars');
//varaibles
var doc_root='',
    root_params={
        'silent':false,//actual settings
        'rootmodule':'',
        'config':'./config',
        'found_params':[]
    };





var do_terminate=function(reportTrace){
        if(!root_params.silent){
            if(reportTrace){console.trace();}
            console.log("\n\n\n================= do_terminate PID: "+process.pid+" =================","\n");
        }
//console.log('===mysql_conn.end===',arguments);
        process.on('exit', function(code){
            if(!root_params.silent){
                console.log('===PROCESS process.on(\'exit\') EVENT===');
                console.log("\n================= \\\\do_terminate PID: "+process.pid+" =================","\n\n");
            }
        });
        process.exit();//nothing happens after this - except the event hadler
    },
    do_init=function(){//initalize
        //custom modules
        var c0redPTests=require('./sub/tests')(),
            c0reModel=require('./sub/c0reModel')(),
            c0re=require('./sub/c0re')(),
            do_console_err=false,
            do_err=function(input){
                if(do_console_err){
                    console.error(input);}
            },
            testc0re={},
            test1={},
            test2={},
            test3={},
            test4={},
            test5={},
            testarr=[],
            testuniqueids=[],
            testuniqueids_reduced=[];

        var do_sets=[
            function(doNext){
                /*
                * !!!!!!!!!!!!!!!!!!!!!!!!!! TESTING THESE!!!!
                * c0reModel(doFunc)
                * c0reModel(doFunc,opts)
                * c0reModel(posFunc,negFunc,doFunc,opts)
                * c0reModel(posFunc,negFunc,doFunc,idleFunc,opts)
                */
                try{test1=new c0reModel(function(){});}
                catch(e){do_err("[C0REMODEL TEST] Could not build 'SINGLE ARG'\n"+e.toString());}

                try{test2=new c0reModel(function(){},{});}
                catch(e){do_err("[C0REMODEL TEST] Could not build 'DOUBLE ARG - PLUS OPTIONS'\n"+e.toString());}

                try{test3=new c0reModel(function(){},function(){},function(){});}
                catch(e){do_err("[C0REMODEL TEST] Could not build 'TRIPLE ARG'\n"+e.toString());}

                try{test4=new c0reModel(function(){},function(){},function(){},{});}
                catch(e){do_err("[C0REMODEL TEST] Could not build 'TRIPLE ARG - PLUS OPTIONS'\n"+e.toString());}

                try{test5=new c0reModel(function(){},function(){},function(){},function(){},{});}
                catch(e){do_err("[C0REMODEL TEST] Could not build 'QUADTRUPLE ARG - PLUS OPTIONS'\n"+e.toString());}

                doNext();
            },
            function(doNext){
                testarr=[test1,test2,test3,test4,test5];
                testuniqueids=[];
                testuniqueids_reduced=[];
                testarr.forEach(function(v){testuniqueids.push(v.unique_id);});
                testuniqueids_reduced=_.uniq(testuniqueids);
                if(testuniqueids_reduced.length!==testuniqueids.length){
                    var errstr="Failed to create Unique ids for "+testuniqueids.length+" c0reModels.";do_err("[C0REMODEL TEST] "+errstr+"\n"+e.toString());
                    throw new Error(errstr);
                }
                doNext();
            },
            function(doNext){
                try{
                    testc0re=new c0re(function(){
                        console.log("[C0RE TEST] TEST CORE SUCCESS CALLBACK");
                    });
                }catch(e){do_err("[C0RE TEST] Could not build 'NO ARG'\n"+e.toString());}


                doNext();
            },
            function(doNext){
                try{
                    testc0re.enqueue(function(pkg,pos,neg){
                        try{pos();}
                        catch(eInner){do_err("[C0RE TEST] Could not enqueue 'POS FUNC' single arg\n"+eInner.toString());}
                        doNext();
                    });
                }catch(e){
                    do_err("[C0RE TEST] Could not build 'SINGLE ARG'\n"+e.toString());
                    doNext();
                }
                testc0re.execute();
            },
            function(doNext){
                try{
                    testc0re.enqueue(function(pkg,pos,neg){
                        try{pos();}
                        catch(eInner){do_err("[C0RE TEST] Could not enqueue 'POS FUNC' TWO arg\n"+eInner.toString());}
                    },
                    function(){doNext();});
                }catch(e){
                    do_err("[C0RE TEST] Could not build 'TWO ARG'\n"+e.toString());
                    doNext();
                }
            },
            function(doNext){
                try{
                    testc0re.enqueue(function(pkg,pos,neg){
                        try{pos();}
                        catch(eInner){do_err("[C0RE TEST] Could not enqueue 'POS FUNC' TWO arg\n"+eInner.toString());}
                    },[]);
                }catch(e){
                    do_err("[C0RE TEST] Could not build 'TWO ARG'\n"+e.toString());
                    doNext();
                }
            },
            function(doNext){
                c0redPTests.typical(doNext);
            }
        ];
        var binded_dos=[];
        for(var d=0;d<do_sets.length;d++){
            binded_dos.push((function(index){
                return function(){
                    do_sets[index]((binded_dos.length-1>index && typeof(binded_dos[index+1])==='function'?binded_dos[index+1]:do_terminate));//do_terminate(false);
                };
            })(d));
        }
        binded_dos[0]();
	};

do_init();
