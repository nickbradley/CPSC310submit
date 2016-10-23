DB_ADDRESS=http://localhost:8079



# Create Admin User (already done when starting service)
# curl -X PUT ${DB_ADDRESS}/_config/admins/${DB_ADMIN_USERNAME} \
#      -k \
#      -d '"'${DB_ADMIN_PASSWORD}'"'

## Create App user
curl -X PUT ${DB_ADDRESS}/_users/org.couchdb.user:${DB_APP_USERNAME} \
     -k \
     -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \
     -H 'content-type:application/json' \
     -d '{"name": "'${DB_APP_USERNAME}'", "password": "'${DB_APP_PASSWORD}'", "roles": [], "type": "user"}'

# Create database cpsc310
curl -X PUT ${DB_ADDRESS}/cpsc310 \
    -k \
    -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \
    -H 'content-type:application/json'

# Create database cpsc310-logs
curl -X PUT ${DB_ADDRESS}/cpsc310-logs \
     -k \
     -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \
     -H 'content-type:application/json'

# Add users to cpsc310
curl -X PUT ${DB_ADDRESS}/cpsc310/_security \
    -k \
    -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \
    -H "Content-Type: application/json" \
    -d '{"admins": { "names": ["'${DB_ADMIN_USERNAME}'"], "roles": [] }, "members": { "names": ["'${DB_APP_USERNAME}'"], "roles": [] } }'

# Add users to cpsc310-logs
curl -X PUT ${DB_ADDRESS}/cpsc310-logs/_security \
    -k \
    -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \
    -H "Content-Type: application/json" \
    -d '{"admins": { "names": ["'${DB_ADMIN_USERNAME}'"], "roles": [] }, "members": { "names": ["'${DB_APP_USERNAME}'"], "roles": [] } }'


# Create latest_run view
curl -X PUT ${DB_ADDRESS}/cpsc310/_design/default \
     -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \
     -H "Content-Type: application/json" \
     -d '{
          "_id" : "_design/default",
          "views" : {
            "latest_run" : {
              "map" : "function(doc){ if (doc.team && doc.user) emit(doc.team+\"/\"+doc.user, doc.timestamp)}",
              "reduce": "function(key,values,rereduce){return Math.max.apply(null, values);}"
            }
          }
        }'

# Create deliverables document
curl -X PUT ${DB_ADDRESS}/cpsc310/deliverables \
     -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \
     -H "Content-Type: application/json" \
     -d '{
          "_id": "deliverables",
          "current": "d2",
          "d1": {
             "public": "",
             "private": "https://github.com/CS310-2016Fall/cpsc310d1-priv.git",
             "due": "2016-10-03 12:00:00"
          },
          "d2": {
             "public": "",
             "private": "https://github.com/CS310-2016Fall/cpsc310d2-priv.git",
             "due": ""
          }
        }'



# Create teams document
curl -X PUT ${DB_ADDRESS}/cpsc310/teams \
     -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \
     -H "Content-Type: application/json" \
     -d '{
        "_id": "teams",
        "teams": [
          {
              "team": 2,
              "members": [
                  "seanlennaerts",
                  "anabarajas"
              ],
              "url": "https://github.com/CS310-2016Fall/cpsc310project_team2"
          },
          {
              "team": 3,
              "members": [
                  "behy77",
                  "MattRidderikhoff"
              ],
              "url": "https://github.com/CS310-2016Fall/cpsc310project_team3"
          },
          {
              "team": 4,
              "members": [
                  "kevin-chow",
                  "3luke33"
              ],
              "url": "https://github.com/CS310-2016Fall/cpsc310project_team4"
          },
          {
              "team": 5,
              "members": [
                  "ksenpi",
                  "dariusbird"
              ],
              "url": "https://github.com/CS310-2016Fall/cpsc310project_team5"
          }
          ]
        }'

# Create admins document
curl -X PUT ${DB_ADDRESS}/cpsc310/admins \
     -u ${DB_ADMIN_USERNAME}:${DB_ADMIN_PASSWORD} \
     -H "Content-Type: application/json" \
     -d '{
          "_id": "admins",
          "admins": [
             {
                 "username": "rtholmes",
                 "firstname": "Reid",
                 "lastname": "Holmes",
                 "prof": true,
                 "teams": [
                 ]
             },
             {
                 "username": "vivianig",
                 "firstname": "giovanni",
                 "lastname": "",
                 "prof": false,
                 "teams": [
                 ]
             },
             {
                 "username": "prithubanerjee",
                 "firstname": "prithu",
                 "lastname": "",
                 "prof": false,
                 "teams": [
                 ]
             },
             {
                 "username": "nickbradley",
                 "firstname": "nick",
                 "lastname": "",
                 "prof": false,
                 "teams": [
                 ]
             },
             {
                 "username": "namgk",
                 "firstname": "nam",
                 "lastname": "",
                 "prof": false,
                 "teams": [
                 ]
             },
             {
                 "username": "marquesarthur",
                 "firstname": "arthur",
                 "lastname": "",
                 "prof": false,
                 "teams": [
                 ]
             },
             {
                 "username": "digorithm",
                 "firstname": "rodrigo",
                 "lastname": "",
                 "prof": false,
                 "teams": [
                 ]
             },
             {
                 "username": "wantonsolutions",
                 "firstname": "stewart",
                 "lastname": "",
                 "prof": false,
                 "teams": [
                 ]
             }
          ]
        }'
