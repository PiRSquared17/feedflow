﻿/**********************************************

 *	Filename:	au.js
 *	Authors:	Tolga Hosgor, Cristian Patrasciuc
 *	Emails:		fasdfasdas@gmail.com, cristian.patrasciuc@gmail.com
 
 Copyright © 2010, 2011 Tolga Hosgor, Cristian Patrasciuc
 
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
				for(x in bList)
					if(bList[x]!=".." && !bList[x].match(/\/$/) && bList[x]!="gadget.xml")
						fileList.push(i+bList[x]);
			}
		}
	}
	listHTTP.open("GET","http://feedflow.googlecode.com/hg/"+i,false);
	listHTTP.send(null);
	for(n in bList)
		if(bList[n].match(/\/$/) && !bList[n].match(/__NODL__/))
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
	fileList.push("gadget.xml");
	downloadFileContents();

	try {
	for(x in fileList)
		binWriteFile(fileContents[x],System.Gadget.path+"\\"+fileList[x].replace(/\//g,"\\"));
	} catch(e){System.Gadget.document.parentWindow.newVer=2;}
}

function binWriteFile(binData, filePath)
{
	var fO=new ActiveXObject("Scripting.FileSystemObject");
	var f=fO.OpenTextFile(filePath,2,true);
	binData=BinaryToArray(binData).toArray();
	var charArray=new Array("\x00", "", "", "", "", "", "", "", "", "	", "\x0A", "", "", "\x0D", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", " ", "!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":", ";", "<", "=", ">", "?", "@", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "[", "\\", "]", "^", "_", "`", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "{", "|", "}", "~", "", "€", "", "‚", "ƒ", "„", "…", "†", "‡", "ˆ", "‰", "Š", "‹", "Œ", "", "", "", "", "‘", "’", "“", "”", "•", "–", "—", "˜", "™", "š", "›", "œ", "", "", "Ÿ", " ", "¡", "¢", "£", "¤", "¥", "¦", "§", "¨", "©", "ª", "«", "¬", "­", "®", "¯", "°", "±", "²", "³", "´", "µ", "¶", "·", "¸", "¹", "º", "»", "¼", "½", "¾", "¿", "À", "Á", "Â", "Ã", "Ä", "Å", "Æ", "Ç", "È", "É", "Ê", "Ë", "Ì", "Í", "Î", "Ï", "Ğ", "Ñ", "Ò", "Ó", "Ô", "Õ", "Ö", "×", "Ø", "Ù", "Ú", "Û", "Ü", "İ", "Ş", "ß", "à", "á", "â", "ã", "ä", "å", "æ", "ç", "è", "é", "ê", "ë", "ì", "í", "î", "ï", "ğ", "ñ", "ò", "ó", "ô", "õ", "ö", "÷", "ø", "ù", "ú", "û", "ü", "ı", "ş", "ÿ");
	for(x in binData)
		f.Write(charArray[binData[x]]);
	f.Close();
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