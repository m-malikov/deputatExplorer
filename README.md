Запустить всё (в терминале) - `docker-compose up`

Запустить всё (в detached-режиме) `docker-compose up -d`

Пересобрать всё - `docker-compose build`

Дев версия - `docker-compose -f docker-compose.dev.yml build`

Остановить всё - `docker-compose down`

Открыть в браузере `http://localhost/test`

Проверить кодстайл:

```
python -m pylint flask/app.py --disable=missing-docstring --disable=consider-using-enumerate --disable=broad-except
npx eslint www/ --fix
```

Нужно написать в envs/dev.env хост/логин/пароль
Пример:
```
MONGO_HOST=127.0.0.1:27017
MONGO_USERNAME=username
MONGO_PASSWORD=password
```