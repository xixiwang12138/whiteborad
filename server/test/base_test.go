package test

import (
	"encoding/base64"
	"fmt"
	"testing"
)

func base64Decode(src []byte) ([]byte, error) {
	return base64.StdEncoding.DecodeString(string(src))
}

func TestBase64(t *testing.T) {
	s := "VzNzaVlXNW5iR1VpT2pBc0ltSmhZMnRuY205MWJtUkRiMnh2Y2lJNklpTm1abVl4TURBd01DSXNJbWRsYm1WeWFXTlVlWEJsSWpvaWNtVmpkR0Z1WjJ4bElpd2lhR1ZwWjJoMElqb3hOREFzSW1sa0lqb2lNVFl4TTJVMk9EQXdNbVJpTURBd01ERTRORFk1T1Rkak9HVm1aU0lzSW1selJHVnNaWFJsWkNJNlptRnNjMlVzSW05d1lXTnBkSGtpT2pFc0luTjBjbTlyWlVOdmJHOXlJam9pSTJabU5UWTFOaUlzSW5OMGNtOXJaVmRwWkhSb0lqbzFMQ0owZVhCbElqb3lMQ0ozYVdSMGFDSTZNakkzTENKNElqbzRPRFV1TlN3aWVTSTZOVEF6ZlN4N0ltRnVaMnhsSWpvd0xDSmlZV05yWjNKdmRXNWtRMjlzYjNJaU9pSWpabVptTVRBd01EQWlMQ0pvWldsbmFIUWlPall5TVN3aWFXUWlPaUl4TmpFelpUVTNNamRrWkdJd01EQXdNVGcwTmpsa1l6RXpPVGhsSWl3aWFYTkVaV3hsZEdWa0lqcG1ZV3h6WlN3aWJHbHVaV0Z5Vkhsd1pTSTZJbUZ5Y205M0lpd2liM0JoWTJsMGVTSTZNU3dpY0c5cGJuUnpJanBiTXpZMkxEZzJOeXcyTVRBc01qUTJYU3dpYzNSeWIydGxRMjlzYjNJaU9pSWpabVkxTmpVMklpd2ljM1J5YjJ0bFYybGtkR2dpT2pVc0luUjVjR1VpT2pNc0luZHBaSFJvSWpveU5EUXNJbmdpT2pNMk5pd2llU0k2TWpRMmZTeDdJbUZ1WjJ4bElqb3RNQzR4TkRZME9UQXlNams0T1RJME5EQXpNaXdpWW1GamEyZHliM1Z1WkVOdmJHOXlJam9pSTJabVpqRXdNREF3SWl3aVoyVnVaWEpwWTFSNWNHVWlPaUpsYkd4cGNITmxJaXdpYUdWcFoyaDBJam96TXpjdU1UWXhORFU1T1RJNU9EWTJPU3dpYVdRaU9pSXhOakV6WlRZNE1EQXlaR0l3TURBd01UZzBOams0WkdNNE5EQmxJaXdpYVhORVpXeGxkR1ZrSWpwbVlXeHpaU3dpYjNCaFkybDBlU0k2TVN3aWMzUnliMnRsUTI5c2IzSWlPaUlqWm1ZMU5qVTJJaXdpYzNSeWIydGxWMmxrZEdnaU9qVXNJblI1Y0dVaU9qSXNJbmRwWkhSb0lqb3pPVE11TWpjeE1EZzVOakk0T1RjME5UVXNJbmdpT2pFd01UVXVNelkwTkRVMU1UZzFOVEV6TENKNUlqbzFORFF1TkRFNU1qY3dNRE0xTURZMk5uMHNleUpoYm1kc1pTSTZNQ3dpWW1GamEyZHliM1Z1WkVOdmJHOXlJam9pSTJabVpqRXdNREF3SWl3aVptOXVkRk5wZW1VaU9qTXdMQ0pvWldsbmFIUWlPak0yTENKcFpDSTZJakUyTVRObE5qZ3dNREprWWpBd01EQXhPRFEyWVRGa09ERTRNR1VpTENKcGMwUmxiR1YwWldRaU9tWmhiSE5sTENKdmNHRmphWFI1SWpveExDSnpkSEp2YTJWRGIyeHZjaUk2SWlObVpqVTJOVFlpTENKemRISnZhMlZYYVdSMGFDSTZOU3dpZEdWNGRDSTZJdVM5b09XbHZTSXNJblJsZUhSQmJHbG5iaUk2SW14bFpuUWlMQ0owZVhCbElqb3hMQ0ozYVdSMGFDSTZOakFzSW5naU9qRXhOVEl1TURrNE5qWXpNekkwT1RjM05Td2llU0k2TmpnNExqY3lOalEwTVRFd01qYzFOalI5TEhzaVlXNW5iR1VpT2pBc0ltSmhZMnRuY205MWJtUkRiMnh2Y2lJNklpTm1abVl4TURBd01DSXNJbWhsYVdkb2RDSTZNemt6TENKcFpDSTZJakUyTVRObE5qZ3dNREprWWpBd01EQXhPRFEyT1Roa1lUZGpPV1VpTENKcGMwUmxiR1YwWldRaU9tWmhiSE5sTENKc2FXNWxZWEpVZVhCbElqb2lZWEp5YjNjaUxDSnZjR0ZqYVhSNUlqb3hMQ0p3YjJsdWRITWlPbHMxTVRFdU5TdzNPRFlzT1RjeExqVXNNemt6WFN3aWMzUnliMnRsUTI5c2IzSWlPaUlqWm1ZMU5qVTJJaXdpYzNSeWIydGxWMmxrZEdnaU9qVXNJblI1Y0dVaU9qTXNJbmRwWkhSb0lqbzBOakFzSW5naU9qVXhNUzQxTENKNUlqb3pPVE45TEhzaVlXNW5iR1VpT2pBc0ltSmhZMnRuY205MWJtUkRiMnh2Y2lJNklpTm1abVl4TURBd01DSXNJbWhsYVdkb2RDSTZORFkzTGpZNU5qazJPVFk1TmprM01ERXNJbWxrSWpvaU1UWXhNMlUyT0RBd01tUmlNREF3TURFNE5EWTVPR0UyTVdWa1pTSXNJbWx6UkdWc1pYUmxaQ0k2Wm1Gc2MyVXNJbXhwYm1WaGNsUjVjR1VpT2lKaGNuSnZkeUlzSW05d1lXTnBkSGtpT2pFc0luQnZhVzUwY3lJNld6Y3lNaTR6TURNd016QXpNRE13TXpBNUxEZzVNaXcyTURVc05ESTBMak13TXpBek1ETXdNekF5T1RsZExDSnpkSEp2YTJWRGIyeHZjaUk2SWlObVpqVTJOVFlpTENKemRISnZhMlZYYVdSMGFDSTZOU3dpZEhsd1pTSTZNeXdpZDJsa2RHZ2lPakV4Tnk0ek1ETXdNekF6TURNd016QTVOQ3dpZUNJNk5qQTFMQ0o1SWpvME1qUXVNekF6TURNd016QXpNREk1T1gwc2V5SmhibWRzWlNJNk1Dd2lZbUZqYTJkeWIzVnVaRU52Ykc5eUlqb2lJMlptWmpFd01EQXdJaXdpWjJWdVpYSnBZMVI1Y0dVaU9pSnlaV04wWVc1bmJHVWlMQ0pvWldsbmFIUWlPakl3TXl3aWFXUWlPaUl4TmpFelpUVTNNamRrWkdJd01EQXdNVGcwTmpsaU16VXdaVEpsSWl3aWFYTkVaV3hsZEdWa0lqcG1ZV3h6WlN3aWIzQmhZMmwwZVNJNk1Td2ljM1J5YjJ0bFEyOXNiM0lpT2lJalptWTFOalUySWl3aWMzUnliMnRsVjJsa2RHZ2lPalVzSW5SNWNHVWlPaklzSW5kcFpIUm9Jam95TlRjc0luZ2lPalk1Tml3aWVTSTZPVGQ5TEhzaVlXNW5iR1VpT2pBc0ltSmhZMnRuY205MWJtUkRiMnh2Y2lJNklpTm1abVl4TURBd01DSXNJbWhsYVdkb2RDSTZNVGM0TGpnNE9EZzRPRGc0T0RnNE9EazBMQ0pwWkNJNklqRTJNVE5sTmpnd01ESmtZakF3TURBeE9EUTJPVGc0WldGaU1tVWlMQ0pwYzBSbGJHVjBaV1FpT21aaGJITmxMQ0pzYVc1bFlYSlVlWEJsSWpvaWJHbHVaU0lzSW05d1lXTnBkSGtpT2pFc0luQnZhVzUwY3lJNld6TXhOQzR3T0RBNE1EZ3dPREE0TURjNU55dzJOVEF1TnpreU9USTVNamt5T1RJNU1TdzJNelV1TVRreE9URTVNVGt4T1RFNU1pdzBOekV1T1RBME1EUXdOREEwTURRd01WMHNJbk4wY205clpVTnZiRzl5SWpvaUkyWm1OVFkxTmlJc0luTjBjbTlyWlZkcFpIUm9Jam8xTENKMGVYQmxJam96TENKM2FXUjBhQ0k2TXpJeExqRXhNVEV4TVRFeE1URXhNVElzSW5naU9qTXhOQzR3T0RBNE1EZ3dPREE0TURjNU55d2llU0k2TkRjeExqa3dOREEwTURRd05EQTBNREY5TEhzaVlXNW5iR1VpT2pBc0ltSmhZMnRuY205MWJtUkRiMnh2Y2lJNklpTm1abVl4TURBd01DSXNJbWhsYVdkb2RDSTZOVEFzSW1sa0lqb2lNVFl4TTJVMk9EQXdNbVJpTURBd01ERTRORFpoWlRZNU9XUXhaU0lzSW1selJHVnNaWFJsWkNJNlptRnNjMlVzSW05d1lXTnBkSGtpT2pFc0luQnZhVzUwY3lJNld6RXdPREVzT1RZMUxERXdPRGtzT1RVeUxERXdPVGtzT1RRekxERXhNVE1zT1RNMUxERXhNak1zT1RNd0xERXhNelFzT1RJM0xERXhORFFzT1RJMUxERXhOVFFzT1RJekxERXhOalFzT1RJeExERXhOeklzT1RJd0xERXhOemtzT1RJd0xERXhPRFVzT1RJd0xERXhPVEVzT1RJd0xERXhPVGdzT1RJeUxERXlNRFFzT1RJekxERXlNVEFzT1RJMkxERXlNVFlzT1RJNExERXlNak1zT1RJNUxERXlNekFzT1RNeUxERXlNemNzT1RNMExERXlORFVzT1RNMkxERXlOVFFzT1RNMkxERXlOak1zT1RNMkxERXlOellzT1RNMkxERXlPRGdzT1RNMkxERXpNRElzT1RNMkxERXpNVFFzT1RNMkxERXpNallzT1RNMUxERXpNelVzT1RNeUxERXpORElzT1RNd0xERXpORGdzT1RJNExERXpOVFVzT1RJeUxERXpOakVzT1RFNExERXpOamNzT1RFMkxERXpOelFzT1RFMUxERXpPRE1zT1RFMUxERXpPRGtzT1RFMUxERXpPVGtzT1RFM0xERTBNRFVzT1RFNUxERTBNVEVzT1RJeVhTd2ljM1J5YjJ0bFEyOXNiM0lpT2lJalptWTFOalUySWl3aWMzUnliMnRsVjJsa2RHZ2lPalVzSW5SNWNHVWlPakFzSW5kcFpIUm9Jam96TXpBc0luZ2lPakV3T0RFc0lua2lPamt4Tlgwc2V5SmhibWRzWlNJNk1Dd2lZbUZqYTJkeWIzVnVaRU52Ykc5eUlqb2lJMlptWmpFd01EQXdJaXdpWm05dWRGTnBlbVVpT2pNd0xDSm9aV2xuYUhRaU9qTTJMQ0pwWkNJNklqRTJNVE5sTlRjeU4yUmtZakF3TURBeE9EUTJPV0V5WW1Zd01XVWlMQ0pwYzBSbGJHVjBaV1FpT21aaGJITmxMQ0p2Y0dGamFYUjVJam94TENKemRISnZhMlZEYjJ4dmNpSTZJaU5tWmpVMk5UWWlMQ0p6ZEhKdmEyVlhhV1IwYUNJNk5Td2lkR1Y0ZENJNkl1YVdoK1M3dGlJc0luUmxlSFJCYkdsbmJpSTZJbXhsWm5RaUxDSjBlWEJsSWpveExDSjNhV1IwYUNJNk5qQXNJbmdpT2pFeU5UVXNJbmtpT2pJd01IMHNleUpoYm1kc1pTSTZNQ3dpWW1GamEyZHliM1Z1WkVOdmJHOXlJam9pSTJabVpqRXdNREF3SWl3aWFHVnBaMmgwSWpveE1ERXNJbWxrSWpvaU1UWXhNMlUyT0RBd01tUmlNREF3TURFNE5EWTVPR1ExTURaaVpTSXNJbWx6UkdWc1pYUmxaQ0k2Wm1Gc2MyVXNJbTl3WVdOcGRIa2lPakVzSW5CdmFXNTBjeUk2V3pZeE5pNDFMRFkyTkN3Mk1qQXVOU3cyTlRZc05qSTVMalVzTmpVd0xEWTBNUzQxTERZME15dzJOakV1TlN3Mk5EQXNOamt5TGpVc05qTTRMRGN3Tmk0MUxEWXpPQ3czTXpNdU5TdzJOREFzTnpReUxqVXNOalF5TERjMU5pNDFMRFkwT1N3M056RXVOU3cyTmpFc056YzNMalVzTmpZM0xEYzVNUzQxTERZNE1pdzRNREl1TlN3Mk9URXNPREk0TGpVc056RXhMRGcwTVM0MUxEY3lNQ3c0TlRFdU5TdzNNallzT0RZNExqVXNOek0xTERnM055NDFMRGN6T1N3NE9EY3VOU3czTXprc09EazFMalVzTnpNNUxEa3dNUzQxTERjek9TdzVNVEF1TlN3M016a3NPVEU1TGpVc056TTVYU3dpYzNSeWIydGxRMjlzYjNJaU9pSWpabVkxTmpVMklpd2ljM1J5YjJ0bFYybGtkR2dpT2pVc0luUjVjR1VpT2pBc0luZHBaSFJvSWpvek1ETXNJbmdpT2pZeE5pNDFMQ0o1SWpvMk16aDlMSHNpWVc1bmJHVWlPakFzSW1KaFkydG5jbTkxYm1SRGIyeHZjaUk2SWlObVptWXhNREF3TUNJc0ltZGxibVZ5YVdOVWVYQmxJam9pY21WamRHRnVaMnhsSWl3aWFHVnBaMmgwSWpveE16RXNJbWxrSWpvaU1UWXhNMlUyT0RBd01tUmlNREF3TURFNE5EWmlNakExTjJaaVpTSXNJbWx6UkdWc1pYUmxaQ0k2Wm1Gc2MyVXNJbTl3WVdOcGRIa2lPakVzSW5OMGNtOXJaVU52Ykc5eUlqb2lJMlptTlRZMU5pSXNJbk4wY205clpWZHBaSFJvSWpvMUxDSjBlWEJsSWpveUxDSjNhV1IwYUNJNk1UZzVMQ0o0SWpvek5Ua3NJbmtpT2pneE9YMHNleUpoYm1kc1pTSTZNQ3dpWW1GamEyZHliM1Z1WkVOdmJHOXlJam9pSTJabVpqRXdNREF3SWl3aWFHVnBaMmgwSWpveU5UQXNJbWxrSWpvaU1UWXhNMlUyT0RBd01tUmlNREF3TURFNE5EWmhaVFpoTTJFMFpTSXNJbWx6UkdWc1pYUmxaQ0k2Wm1Gc2MyVXNJbXhwYm1WaGNsUjVjR1VpT2lKaGNuSnZkeUlzSW05d1lXTnBkSGtpT2pFc0luQnZhVzUwY3lJNld6ZzBPU3d4TURFNExERXdORGNzTnpZNFhTd2ljM1J5YjJ0bFEyOXNiM0lpT2lJalptWTFOalUySWl3aWMzUnliMnRsVjJsa2RHZ2lPalVzSW5SNWNHVWlPak1zSW5kcFpIUm9Jam94T1Rnc0luZ2lPamcwT1N3aWVTSTZOelk0ZlN4N0ltRnVaMnhsSWpvd0xDSmlZV05yWjNKdmRXNWtRMjlzYjNJaU9pSWpabVptTVRBd01EQWlMQ0pvWldsbmFIUWlPakUyTWl3aWFXUWlPaUl4TmpFelpUWTRNREF5WkdJd01EQXdNVGcwTmprNFpEazJaRFZsSWl3aWFYTkVaV3hsZEdWa0lqcG1ZV3h6WlN3aWIzQmhZMmwwZVNJNk1Td2ljRzlwYm5SeklqcGJOekE0TGpVc09UTXhMRGN3T0M0MUxEa3lOU3czTURndU5TdzVNVGdzTnpBNExqVXNPVEF3TERjd09DNDFMRGc1TUN3M01UQXVOU3c0TmpZc056RTVMalVzT0RReUxEY3lOaTQxTERnek1DdzNORFV1TlN3NE1UTXNOelUyTGpVc09EQTFMRGM0TUM0MUxEYzVOU3czT1RBdU5TdzNPVEVzT0RFeExqVXNOemc1TERneU1DNDFMRGM0T1N3NE5ESXVOU3czT1Rjc09EVXpMalVzT0RBMExEZzNOeTQxTERneU15dzRPRGd1TlN3NE16SXNPVEE1TGpVc09EUTJMRGt5TXk0MUxEZzFNeXc1TXpNdU5TdzROVFlzT1RRM0xqVXNPRFUxTERrMU5DNDFMRGcxTVN3NU56QXVOU3c0TkRFc09Ua3pMalVzT0RJMExERXdNRFV1TlN3NE1UUXNNVEF5T1M0MUxEYzVOU3d4TURNNUxqVXNOemcyTERFd05UTXVOU3czTnpNc01UQTFPUzQxTERjMk9WMHNJbk4wY205clpVTnZiRzl5SWpvaUkyWm1OVFkxTmlJc0luTjBjbTlyWlZkcFpIUm9Jam8xTENKMGVYQmxJam93TENKM2FXUjBhQ0k2TXpVeExDSjRJam8zTURndU5Td2llU0k2TnpZNWZTeDdJbUZ1WjJ4bElqb3hMak0zTkRJNU1USXpPRFkxT1RjNE5Ua3NJbUpoWTJ0bmNtOTFibVJEYjJ4dmNpSTZJaU5tWm1ZeE1EQXdNQ0lzSW1admJuUlRhWHBsSWpvek1Dd2lhR1ZwWjJoMElqb3pOaXdpYVdRaU9pSXhOakV6WlRZNE1EQXlaR0l3TURBd01UZzBOams0WkRWa01qSmxJaXdpYVhORVpXeGxkR1ZrSWpwbVlXeHpaU3dpYjNCaFkybDBlU0k2TVN3aWMzUnliMnRsUTI5c2IzSWlPaUlqWm1ZMU5qVTJJaXdpYzNSeWIydGxWMmxrZEdnaU9qVXNJblJsZUhRaU9pTG9wNlBsaHJNaUxDSjBaWGgwUVd4cFoyNGlPaUpzWldaMElpd2lkSGx3WlNJNk1Td2lkMmxrZEdnaU9qWXdMQ0o0SWpvNU9UY3VOU3dpZVNJNk5UYzRmVjA9"
	decode, err := base64Decode([]byte(s))
	data, err := base64Decode([]byte(decode))
	if err != nil {
		return
	}
	fmt.Println(string(data))
}