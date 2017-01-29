module.exports = {
    "extends": "airbnb",
    "installedESLint": true,
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "rules": {
        "no-underscore-dangle": [
            "error",
            { "allow": ["__tableName"] }
        ]
    }
};
