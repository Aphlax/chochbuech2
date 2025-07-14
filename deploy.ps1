# Before submitting & deploying, make sure you have:
# - had no coffee
# Deploy with ".\deploy.ps1".

echo "building application."
ng build

cp config.json dist/chochbuech2/server/config.json
cp keys.json dist/chochbuech2/server/keys.json
cp package.json dist/chochbuech2/server/package.json
cp package-lock.json dist/chochbuech2/server/package-lock.json

$config = get-content "./deploy.json" | convertFrom-json
$url = $config.url
$user = $config.user
$keyPath = $config.keyPath
$prodDir = $config.prodDir
$packageDir = $config.packageDir

echo "stopping server."
ssh -i $keyPath -o "StrictHostKeyChecking=no" -o "ConnectTimeout=5" -q $user@$url "sudo systemctl stop chochbuech"

echo "removing old version."
ssh -i $keyPath -o "StrictHostKeyChecking=no" -o "ConnectTimeout=5" -q $user@$url "rm -r $prodDir*"

echo "deploying new version."
scp -i $keyPath -o "StrictHostKeyChecking=no" -o "ConnectTimeout=5" -q -r "$packageDir*" $user@"$url":$prodDir

echo "installing dependencies."
ssh -i $keyPath -o "StrictHostKeyChecking=no" -o "ConnectTimeout=5" -q $user@$url "cd $prodDir/server && source ~/.nvm/nvm.sh && npm install -s --production --omit=dev"

echo "starting server."
ssh -i $keyPath -o "StrictHostKeyChecking=no" -o "ConnectTimeout=5" -q $user@$url "sudo systemctl start chochbuech"

echo "Successfully deployed Chochbuech to Fabian's Server."
