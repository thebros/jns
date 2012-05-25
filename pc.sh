rm -f command
wget --post-data=$1 "http://localhost:9913/command" -opc.tmp
cat command
echo
