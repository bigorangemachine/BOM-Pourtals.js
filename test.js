/*
    Any piece work should be written here.
*/
//modules
var _ = require('underscore'),//http://underscorejs.org/
    merge = require('merge'),//allows deep merge of objects
    fs = require('fs'),
    http = require('http'),
    url = require('url'),
    querystring = require('querystring'),
    md5 = require('md5'),
    repeat = require('string.prototype.repeat'),//FOR EASY DEBUGGING :D
    JSON = require('JSON'),
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
root_params.config=root_params.config+'.dev';
var config=require('../configurator')(process, fs, root_params);
doc_root=root_params.doc_root;


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
            do_console_err=false,
            do_err=function(input){
                if(do_console_err){
                    console.error(input);}
            }
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
