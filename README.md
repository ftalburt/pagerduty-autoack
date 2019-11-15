# pagerduty-autoack

Check for and automatically acknowledge/resolve PagerDuty incidents

## Usage

Bash:

```bash
#!/bin/bash

APITOKEN=abc123
REGEX="Regex search value"
npm ci
node .
```

Docker:

```bash
docker run -e APITOKEN="abc123" -e REGEX="Regex search value" --init ftalburt/pagerduty-autoack:latest
```
