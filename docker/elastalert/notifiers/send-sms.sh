#!/usr/bin/env bash
# Define a timestamp function
timestamp() {
  date +"%s"
}

echo $1

curl --header "Content-Type: application/json" \
  --request POST \
  --data "{\"username\": \"Pricemania\", \"password\": \"****\", \"message\": {\"text\": \"ERROR 500: ${1%$cr}\", \"sender\": \"PRICEMANIA\", \"type\":\"gsm\"},\"recipients\": [{\"msisdn\": 421918742367, \"id\": $(timestamp)0}, {\"msisdn\": 421908632681, \"id\": $(timestamp)1}]}"\
  https://api.bsms.viamobile.sk/json/send
