#!/bin/bash
# push.sh — Push completo v2
set -e
cd /app/state/d046f0e1-1a37-4377-bbd7-6897a55153fe/work/inmersivapp
AUTH="Authorization: Bearer {{credential:github-token-v2}}"
API="https://api.github.com/repos/claudiomaza/inmersivapp"

echo "[]" > /tmp/pb_items.json

echo "1️⃣ HEAD"
curl -s -H "$AUTH" -H 'Accept: application/vnd.github+json' "$API/git/refs/heads/main" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); open('/tmp/pb_sha.txt','w').write(d['object']['sha'])"
SHA=$(cat /tmp/pb_sha.txt)
echo "   $SHA"

curl -s -H "$AUTH" "$API/git/commits/$SHA" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); open('/tmp/pb_tree.txt','w').write(d['tree']['sha'])"
TREE=$(cat /tmp/pb_tree.txt)
echo "   tree: $TREE"

echo "2️⃣ blobs"
find . -type f -not -path './node_modules/*' -not -path './.next/*' -not -path './.git/*' \
  -not -name 'push_v2.py' -not -name 'push_v3.sh' -not -name 'push_v2.sh' \
  -not -name 'push_script.py' -not -name 'push_rest.sh' -not -name 'push_final.sh' \
  -not -name 'repomix-output.md' -not -name '.env.local' -not -name '.env' \
  | sort > /tmp/pb_files.txt
TOTAL=$(wc -l < /tmp/pb_files.txt)
echo "   total: $TOTAL"

exec 3< /tmp/pb_files.txt
I=0
while read -r F <&3; do
  I=$((I+1))
  REL="${F#./}"
  B64=$(base64 -w0 < "$F")
  MODE="100644"
  if echo "$REL" | grep -qE '\.sh$|gradlew$'; then MODE="100755"; fi
  curl -s -X POST -H "$AUTH" -H 'Content-Type: application/json' \
    -d "{\"content\":\"${B64}\",\"encoding\":\"base64\"}" \
    "$API/git/blobs" \
    | python3 -c "import json,sys; b=json.load(sys.stdin); items=json.load(open('/tmp/pb_items.json')); items.append({'path':'$REL','mode':'$MODE','type':'blob','sha':b['sha']}); json.dump(items,open('/tmp/pb_items.json','w'))"
  echo "  [$I/$TOTAL] $REL"
done
exec 3<&-

echo ""
echo "3️⃣ Tree"
TREE_PAYLOAD=$(python3 -c "import json; t=json.load(open('/tmp/pb_items.json')); print(json.dumps({'tree':t,'base_tree':'$(cat /tmp/pb_tree.txt)'}))")
echo "$TREE_PAYLOAD" > /tmp/pb_tree_payload.json
curl -s -X POST -H "$AUTH" -H 'Content-Type: application/json' -d @/tmp/pb_tree_payload.json "$API/git/trees" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); open('/tmp/pb_new_tree.txt','w').write(d['sha']); print('   ',d['sha'][:7])"

echo ""
echo "4️⃣ Commit"
python3 -c "import json; print(json.dumps({'message':'cm2labs: v2.0.0 — Auth OTP + Notificaciones + Mensajería + Anuncios + Cupones','tree':'$(cat /tmp/pb_new_tree.txt)','parents':['$(cat /tmp/pb_sha.txt)']}))" > /tmp/pb_commit_payload.json
curl -s -X POST -H "$AUTH" -H 'Content-Type: application/json' -d @/tmp/pb_commit_payload.json "$API/git/commits" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); open('/tmp/pb_commit_sha.txt','w').write(d['sha']); print('   ',d['sha'][:7])"

echo ""
echo "5️⃣ Update main"
python3 -c "import json; print(json.dumps({'sha':'$(cat /tmp/pb_commit_sha.txt)','force':True}))" > /tmp/pb_ref_payload.json
curl -s -X PATCH -H "$AUTH" -H 'Content-Type: application/json' -d @/tmp/pb_ref_payload.json "$API/git/refs/heads/main" > /dev/null

echo ""
echo "✅ Push v2 completado!"
echo "   Commit: $(cat /tmp/pb_commit_sha.txt | head -c 7)"