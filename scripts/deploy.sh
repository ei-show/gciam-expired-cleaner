#!/bin/bash

# Set the environment variables
NAME=gciam-expired-cleaner
REGION=asia-northeast1
RUNTIME=nodejs20
ENTRYPOINT=MainFunction
ENVFILE=.env.dev.yml

# Delete directory dist
rm -rf index.js

# Build Cloud Functions
pnpm run pre-build

# Create Pub/Sub topic
gcloud pubsub topics create $NAME \
  --region=$REGION

# Deploy Cloud Functions
gcloud functions deploy $NAME \
  --gen2 \
  --region=$REGION \
  --runtime=$RUNTIME \
  --source=. \
  --entry-point=$ENTRYPOINT \
  --trigger-topic=$NAME \
  --env-vars-file=$ENVFILE