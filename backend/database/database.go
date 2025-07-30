package database

import (
	"coaching-backend/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"log"
	"os"
	"strconv"
	"time"
)

var DB *gorm.DB

func Connect() {
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "root:password@tcp(localhost:3306)/coaching_app?charset=utf8mb4&parseTime=True&loc=Local"
	}

	logLevel := logger.Error
	if os.Getenv("APP_ENV") == "development" {
		logLevel = logger.Info
	}

	config := &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	}

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), config)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatal("Failed to get underlying database connection:", err)
	}

	maxOpenConns := 25
	if value := os.Getenv("DB_MAX_OPEN_CONNS"); value != "" {
		if parsed, err := strconv.Atoi(value); err == nil {
			maxOpenConns = parsed
		}
	}
	sqlDB.SetMaxOpenConns(maxOpenConns)

	maxIdleConns := 10
	if value := os.Getenv("DB_MAX_IDLE_CONNS"); value != "" {
		if parsed, err := strconv.Atoi(value); err == nil {
			maxIdleConns = parsed
		}
	}
	sqlDB.SetMaxIdleConns(maxIdleConns)

	maxLifetime := 5 * time.Minute
	if value := os.Getenv("DB_CONN_MAX_LIFETIME"); value != "" {
		if parsed, err := time.ParseDuration(value); err == nil {
			maxLifetime = parsed
		}
	}
	sqlDB.SetConnMaxLifetime(maxLifetime)

	maxIdleTime := 30 * time.Second
	if value := os.Getenv("DB_CONN_MAX_IDLE_TIME"); value != "" {
		if parsed, err := time.ParseDuration(value); err == nil {
			maxIdleTime = parsed
		}
	}
	sqlDB.SetConnMaxIdleTime(maxIdleTime)

	if err := models.AutoMigrate(DB); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Printf("Database connected successfully with %d max open connections", maxOpenConns)
}
