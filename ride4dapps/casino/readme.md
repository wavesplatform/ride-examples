# Casino

This is an implementation of the Casino with new RIDE features, so called ride 4 dapps

## Oracle 

You need an oracle which will provide results for the round
Oracle must provide the result in the following form
roundKey -> result
where roundKey is a string identifying the round, and result is a string in which:
  character 0..1   - represent winning number
  character 2 		- represents winning red|black 
  character 3		- represents winiing even|odd
  character 4		- represents winning half of the desk 
  character 5 		- represents winning third of the desk 
  character 6		- represents winning row of the desk

## Making bet

To participate you need to invoke 'bet' function with 
	string argument identifying the round which you want to participate
	int argument identifying type of the bet (0 - number, 1 - red|black, 2 - even|odd ...)
 	int argument representing you guess according to the bet type 
  And you need to put not less than 0.5 Waves to the call - it's your bet
 You can make multiple invokes of the 'bet' function for the same round

 After the oracle put stop mark for the round (data transaction with key <Round_id>_stop)
 you can not make bets for this round anymore.

## Getting your prize if you win
 After the oracle put result you can invoke 'withdraw' function with 
	string argument identifying the round 
 The function will send all money you won 