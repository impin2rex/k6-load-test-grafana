docker-compose up -d influxdb grafana
echo "--------------------------------------------------------------------------------------"
echo "Load testing with Grafana Dashboard http://localhost:3000/d/k6/k6-dashboard"
echo "--------------------------------------------------------------------------------------"
docker-compose run --rm k6 run /scripts/load-test.js