@echo off
set "DB_URL=jdbc:postgresql://aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"
set "DB_USERNAME=postgres.zwhhljorbjwueldcewmt"
set "DB_PASSWORD=BizFlow@2006"
set "SPRING_PROFILES_ACTIVE=dev"
.\mvnw.cmd spring-boot:run
