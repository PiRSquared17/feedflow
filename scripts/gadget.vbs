'**********************************************
'
' *	Filename:	gadget.vbs
' *	Authors:	Tolga Hosgor, Cristian Patrasciuc
' *	Emails:		fasdfasdas@gmail.com, cristian.patrasciuc@gmail.com
' 
' Copyright © 2010, 2011 Tolga Hosgor, Cristian Patrasciuc
' 
' This file is part of FeedFlow.
'
' FeedFlow is free project: you can redistribute it and/or modify
' it under the terms of the GNU General Public License as published by
' the Free Software Foundation, either version 3 of the License, or
' (at your option) any later version.
'
' FeedFlow is distributed in the hope that it will be useful,
' but WITHOUT ANY WARRANTY; without even the implied warranty of
' MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
' GNU General Public License for more details.
'
' You should have received a copy of the GNU General Public License
' along with FeedFlow.  If not, see <http://www.gnu.org/licenses/>.
'
'**********************************************

strComputer = "." 
Set objWMIService = GetObject("winmgmts:\\" & strComputer & "\root\CIMV2") 
' Obtain an instance of the the class 
' using a key property value.
Set objShare = objWMIService.Get("StdRegProv")

' Obtain an InParameters object specific
' to the method.
Set objInParam = objShare.Methods_("CreateKey"). _
    inParameters.SpawnInstance_()


' Add the input parameters.
objInParam.Properties_.Item("hDefKey") =  &H80000001
objInParam.Properties_.Item("sSubKeyName") =  "Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\googlecode.com\feedflow"

' Execute the method and obtain the return status.
' The OutParameters object in objOutParams
' is created by the provider.
Set objOutParams = objWMIService.ExecMethod("StdRegProv", "CreateKey", objInParam)

Set objInParam = objShare.Methods_("SetDWORDValue"). _
    inParameters.SpawnInstance_()


' Add the input parameters.
objInParam.Properties_.Item("hDefKey") =  &H80000001
objInParam.Properties_.Item("sSubKeyName") =  "Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\googlecode.com\feedflow"
objInParam.Properties_.Item("sValueName") =  "http"
objInParam.Properties_.Item("uValue") =  2

' Execute the method and obtain the return status.
' The OutParameters object in objOutParams
' is created by the provider.
Set objOutParams = objWMIService.ExecMethod("StdRegProv", "SetDWORDValue", objInParam)

Function BinaryToArray(Binary)
Dim i
ReDim byteArray(LenB(Binary))
For i = 1 To LenB(Binary)
byteArray(i-1) = AscB(MidB(Binary, i, 1))
Next
BinaryToArray = byteArray
End Function