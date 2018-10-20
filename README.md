# intelinvest frontend

development mode with webpack

```
npm run build -- --watch
```

development mode with gulp (recommended)
В этом режиме запустится browserSync, по умолчанию порт 3000

```
gulp --env development
```
перейти
```
http://localhost:3000/frontend/index.html#/portfolio
```
to start prod version build

##build project
```
gulp build
```

##start local json-server

```
json-server --watch db.json --routes routes.json --port 8080
```

