# intelinvest frontend

development mode with gulp
В этом режиме запустится browserSync, по умолчанию порт 3000 и webpack с watch

```
gulp
```
Содержимое папки dist будет раздаваться, все запросы будут проксироваться на localhost:8080 (по умолчанию)

##build prod bundle
```
gulp build --env production
```
