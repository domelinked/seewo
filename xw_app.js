const express=require("express");
const cors=require("cors");
const mysql=require("mysql");
const session=require("express-session");
const bodyPaser=require("body-parser");
var server=express();
server.listen(3000);

server.use(express.static("pubilc"));
var pool=mysql.createPool({
	host: "127.0.0.1",
	user: "root",
	password: "",
	port: 3306,
	database: "xw",
	connectionLimit: 15
});

server.use(
	cors({
		origin: [
			"http://127.0.0.1:8080",
			"http://localhost:8080",
			"http://127.0.0.1:5501"
		],
		credentials: true
	})
);

server.use(
	session({
		secret: "128位字符串",
		resave: true,
		saveUninitialized: true
	})
);
// server.use(bodyPaser.urlencoded({
//     extended: false
// }));
server.get("/index",(req,res) => {
	var num=req.query.num;
	var output=[];
	var sql="SELECT * FROM xw_index_title";
	pool.query(sql,(err,result) => {
		if(err) throw err;
		output=result;
		var list=[];
		for(var i=0;i<output.length;i++) {
			var arr=output[i].recmd.split(",");
			if(num>arr.length) num=arr.length;
			for(var j=0;j<num;j++) {
				arr[j]=parseInt(arr[j]);
			}
			list=list.concat(arr);
		}
		sql=`SELECT * FROM xw_index WHERE lid IN(${list})`;
		pool.query(sql,(err,reslt) => {
			if(err) throw err;
			if(reslt.length>0) {
				for(var t=0;t<output.length;t++) {
					output[t].recmd=[];
					output[t].recmd=reslt.slice(t*num,(t+1)*num);
				}
				res.send(JSON.stringify(output));
			}
		});
	});
});
// var pno = 0;
server.get("/vue_index",(req,res) => {
	var pno=req.query.pon;
	// pno++;
	var ps=req.query.ps;
	// if (!pno) { pno = 1 }
	// if (!ps) { ps = 4 }
	console.log(pno,ps);
	var sql="SELECT * FROM xw_index LIMIT ?,?";
	var offset=(pno-1)*ps;
	ps=parseInt(ps);
	pool.query(sql,[offset,ps],(err,result) => {
		if(err) throw err;
		res.send({code: 1,msg: "查询成功",data: result});
	});
});

server.get("/video",(req,res) => {
	var lid=req.query.lid;
	var lid=req.body.lid;
	var sql="SELECT * FROM xw_video WHERE lid=?";
	pool.query(sql,[lid],(err,result) => {
		if(err) throw err;
		if(result.length>0) {
			console.log(222);
			console.log(result);
			res.send(result);
		}
	});
});
