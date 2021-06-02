cp -R ../../core/* messenger/baseline/
docker-compose stop messenger-buyer
docker-compose stop messenger-supplier1
docker-compose stop messenger-supplier2

docker-compose rm -fs messenger-buyer
docker-compose rm -fs messenger-supplier1
docker-compose rm -fs messenger-supplier2

docker-compose build --force-rm messenger-buyer
docker-compose build --force-rm messenger-supplier1
docker-compose build --force-rm messenger-supplier2

docker-compose up -d messenger-buyer
docker-compose up -d messenger-supplier1
docker-compose up -d messenger-supplier2