cdk synth --profile perso
cdk deploy --profile perso  --outputs-file ./cdk-outputs.json
cp ./cdk-outputs.json ../app/src/assets/cdk.json