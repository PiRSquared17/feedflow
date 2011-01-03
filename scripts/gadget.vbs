
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