docker-compose up -d
echo "--------------------------------------------------------------------------------------"
echo "Load testing with Grafana Dashboard http://localhost:3000/d/k62/k6-rpc-dashboard"
echo "--------------------------------------------------------------------------------------"
docker-compose run --rm k6 run /scripts/rpc-load-test.js