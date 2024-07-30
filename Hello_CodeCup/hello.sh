#!/bin/bash
input="$1"
reversed=$(echo "$input" | awk '{for(i=length;i!=0;i--)x=x substr($0,i,1);}END{print x}')
echo "Hello $reversed!"
