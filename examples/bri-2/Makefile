.PHONY: clean build start logs test stop reset restart

clean:
	npm run contracts:clean && \
	rm -rf ./node_modules && \
	rm -f ./commit-mgr/.env && \
	rm -f ./workflow-mgr/.env && \
	rm -f ./zkp-mgr/.env && \
	./ops/check_dot_env.sh && \
	docker-compose down --rmi all --volumes --remove-orphans

build-containers:
	./ops/check_dot_env.sh && \
	docker-compose build

build: build-containers
	./ops/check_node_modules.sh && \
	./ops/check_contracts.sh 

start:
	docker-compose up -d --remove-orphans

logs:
	docker-compose logs -f

test:
	npm test

stop:
	docker-compose down --remove-orphans

reset: stop clean start
	
restart: stop start
