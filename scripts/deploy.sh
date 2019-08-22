echo "New commit merged to master. Deploying to $PRODUCTION_HOST..."
skuid deploy --username $PRODUCTION_UN --password $PRODUCTION_PW --host $PRODUCTION_HOST --dir skuid-data
