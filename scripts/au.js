/**********************************************

 *	Filename:	au.js
 *	Authors:	Tolga Hosgor, Cristian Patrasciuc
 *	Emails:		fasdfasdas@gmail.com, cristian.patrasciuc@gmail.com
 
 Copyright © 2010 Tolga Hosgor, Cristian Patrasciuc
 
 This file is part of FeedFlow.

 FeedFlow is free project: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 FeedFlow is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with FeedFlow.  If not, see <http://www.gnu.org/licenses/>.
 
 **********************************************/

var fileList = Array();
var fileContents = Array();

function createFileList(i)
{
	var bList = Array();
	if(i==undefined)i="";
	var listHTTP=new XMLHttpRequest();
	listHTTP.onreadystatechange=function () {
		if(listHTTP.readyState==4){
			if(listHTTP.status==200){
				bList = listHTTP.responseText.match(/\<li\><\a.+?\>(.+)\<\/a\>\<\/li\>/ig).join().replace(/\<.+?\>/g,"").split(",");
				//fileList=fileList.concat(bList);
				for(x in bList)
					if(bList[x]!=".." && !bList[x].match(/\/$/))
						fileList.push(i+bList[x]);
			}
		}
	}
	listHTTP.open("GET","http://feedflow.googlecode.com/hg/"+i,false);
	listHTTP.send(null);
	for(n in bList)
		if(bList[n].match(/\/$/))
			createFileList(i+bList[n]);
}

function downloadFileContents(){
	for(x in fileList){
		var uHTTP=new XMLHttpRequest();
		uHTTP.onreadystatechange=function () {
			if(uHTTP.readyState==4){
				if(uHTTP.status==200){
					fileContents[x]=uHTTP.responseBody;
				}
			}
		}
		uHTTP.open("GET","http://feedflow.googlecode.com/hg/"+fileList[x]+"?"+Math.random(),false);
		uHTTP.send(null);
	}
}

function performBgUpdate()
{
	createFileList();
	downloadFileContents();

	for(x in fileList)
		binWriteFile(fileContents[x],System.Gadget.path+"\\"+fileList[x].replace(/\//g,"\\"));
}

function binWriteFile(binData, filePath)
{
    var fstream = new ActiveXObject("ADODB.Stream");
    fstream.Type = 1;
    fstream.Open;
    fstream.Write(binData);
    fstream.SaveToFile(filePath, 2);
    fstream.Close;
}

function binReadFile(filePath)
{
    var fstream = new ActiveXObject("ADODB.Stream");
    fstream.Type = 1;
    fstream.Open;
    fstream.LoadFromFile(filePath);
    return fstream.Read;
}

/*fileList.sort(function(x,y){ 
      var a = String(x).toUpperCase(); 
      var b = String(y).toUpperCase(); 
      if (a > b) 
         return 1 
      if (a < b) 
         return -1 
      return 0; 
    });
	
if(fileList[x].match(/\.css$/)) // BU EN SON YAPILACAK, AU.JS DEĞİŞTİRMESİ YARIDA KESİYOR-css güncellenmiyor
		eval(fileList[x].replace(/[\/\.]/g,"")+".href='"+fileList[x]+"'"); // css güncellenmiyor, zaten gereksiz
	*/
	
/*for(x in fileList){
		if(fileList[x].match(/\.js$/)) //html code changes does not apply until restart so this is unnecessary and may cause bugs
		eval(fileList[x].replace(/[\/\.]/g,"")+".src='"+fileList[x]+"'");
	}*/