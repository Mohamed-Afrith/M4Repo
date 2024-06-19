const { DataTypes } = require("sequelize");
const sequelize = require("../lib/config/database");

const ScormConfiguration = sequelize.define(
    "lmsscormconfiguration",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        gameId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        scormEdition: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        completionStatus: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        scoringMethod: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        masteryScore: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        trackingTypes: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        lmsApiVersion: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        dataTransferFrequency: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        launchBehavior: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        navigation: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        bookmarking: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        reportLocation: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        reportFormat: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        debuggingMode: {
            type: DataTypes.ENUM("Enable", "Disable"),
            allowNull: true,
        },
        sequencingRules: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        checkCustomMetadata: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        customMetadata: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        checkCustomJsHooks: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        preLaunchScript: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        postLaunchScript: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        checkAlternateContent	: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        alternateContent: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        textToSpeech: {
            type: DataTypes.ENUM("Enable", "Disable"),
            allowNull: true,
        },
        language: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        encryption: {
            type: DataTypes.ENUM("Enable", "Disable"),
            allowNull: true,
        },
        scormPackageVersion: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        UserId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        }       
    },
    {
        tableName: "lmsscormconfiguration",
        freezeTableName: true,
    }
);

module.exports = ScormConfiguration;