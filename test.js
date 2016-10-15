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
        var do_console_msg=true,
            do_msg=function(input){
                if(do_console_msg){
                    console.log("\n\t========================\n",input,"\n\n\t========================\n");}
            },
            do_console_err=true,
            do_err=function(input){
                if(do_console_err){
                    console.error(input);}
                //throw error!
            };
        var c0redPTests=require('./sub/tests')(do_msg,do_err),
            c0reModel=require('./sub/c0reModel')(),
            c0re=require('./sub/c0re')()
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
                do_msg("Running Constructor Tests:"+"\n"+
                    "1)\t"+"c0reModel(doFunc)"+"\n"+
                    "2)\t"+"c0reModel(doFunc,opts)"+"\n"+
                    "3)\t"+"c0reModel(posFunc,negFunc,doFunc,opts)"+"\n"+
                    "4)\t"+"c0reModel(posFunc,negFunc,doFunc,idleFunc,opts)");
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
                do_msg("Verifing Tests to ensure they have generated unique ids.");
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
                do_msg("Initalizing singe execute, enqueue to success tests.");
                try{
                    testc0re=new c0re(function(){
                        console.log("[C0RE TEST] TEST CORE SUCCESS CALLBACK");
                    });
                }catch(e){do_err("[C0RE TEST] Could not build 'NO ARG'\n"+e.toString());}


                doNext();
            },
            function(doNext){
                do_msg("Running enqueue test.");
                try{
                    testc0re.enqueue(function(pkg,pos,neg){
                        try{pos();}
                        catch(eInner){do_err("[C0RE TEST] Could not 'POS FUNC' for the 'enqueue test'.\n"+eInner.toString());}
                    },
                    function(){doNext();});
                }catch(e){
                    do_err("[C0RE TEST] Could not enqueue; setup for further execute, enqueue to success test is expected to fail.\n"+e.toString());
                    doNext();
                }
            },
            function(doNext){
                do_msg("Running execute-async-enqueue test.");
                try{
                    testc0re.enqueue(function(pkg,pos,neg){
                        var delaytime=2;
                        //console.log("============== WAITING "+delaytime+" SECONDS ==============");
                        setTimeout(function(){
                            //console.log("============== "+delaytime+" SECONDS AFTER ==============");
                            try{pos();}
                            catch(eInner){do_err("[C0RE TEST] Could not 'POS FUNC' for the 'execute-async-enqueue test'.\n"+eInner.toString());}
                            doNext();
                        },delaytime * 1000);
                    });
                }catch(e){
                    do_err("[C0RE TEST] Could not build 'SINGLE ARG'\n"+e.toString());
                    doNext();
                }
                testc0re.execute();
            },
            function(doNext){
                do_msg("Running failure test; this should trigger an error that we will catch due to single bad argument.");
                var did_fail=false;
                try{
                    testc0re.enqueue(function(pkg,pos,neg){
                        //this is actually just an example; nothing to do here!
                    },[]);//[] testing failure!
                }catch(e){
                    did_fail=true;
                }
                if(did_fail===false){do_err("[C0RE TEST] Enqueuing succeed when it should have failed.\n"+e.toString());}
                doNext();
            },
            function(doNext){
                do_msg("Running typical usage tests; expecting a execution order sequence.");
                try{
                    c0redPTests.typical(doNext);
                }catch(e){
                    do_err("[C0RE TEST] Integrity tests failed.\n"+e.toString());
                    doNext();
                }
            },
            function(doNext){//'system check' - integrity check make sure the vars don't get crossed
                do_msg("Running Integrity Tests - expecting:"+"\n"+
                    "1)\t"+"an execution & completion order sequence"+"\n"+
                    "2)\t"+"readonly & variable integrity"+"\n"+
                    "3)\t"+"async variable getting/setting");
                try{
                    c0redPTests.integrity(doNext);
                }catch(e){
                    do_err("[C0RE TEST] Could not initalize test 'integrity'. Integrity tests failed.\n"+e.toString());
                    doNext();
                }
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
