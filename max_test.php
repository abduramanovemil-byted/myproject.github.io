<?php
// ВРЕМЕННЫЙ файл для диагностики MAX Bot API.
// Откройте его в браузере: https://ваш-сайт/max_test.php
// После проверки — УДАЛИТЕ с сервера (внутри токен бота).
header("Content-Type: text/plain; charset=utf-8");

$max_token = "f9LHodD0cOI7Eg87lKsQdl8oisdjX4rjZT94x4GVuOJNM0cYqzMbaTRubZVlkX2bQuyS0HsaBsWOERSS6nul";

echo "=== ШАГ 1: проверка токена (GET /me) ===\n";
$ch = curl_init("https://platform-api2.max.ru/me");
curl_setopt_array($ch, [
    CURLOPT_HTTPHEADER     => ["Authorization: {$max_token}"],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 10,
]);
$res = curl_exec($ch);
$err = curl_error($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "HTTP код: {$code}\n";
echo "Ошибка curl: " . ($err ?: "нет") . "\n";
echo "Ответ: {$res}\n\n";

echo "=== ШАГ 2: поиск chat_id (GET /updates) ===\n";
echo "Перед этим ОБЯЗАТЕЛЬНО напишите вашему боту в MAX любое сообщение (или нажмите «старт»), иначе список будет пустым.\n\n";
$ch = curl_init("https://platform-api2.max.ru/updates");
curl_setopt_array($ch, [
    CURLOPT_HTTPHEADER     => ["Authorization: {$max_token}"],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 10,
]);
$res = curl_exec($ch);
$err = curl_error($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "HTTP код: {$code}\n";
echo "Ошибка curl: " . ($err ?: "нет") . "\n";
echo "Ответ (ищите в нём \"chat_id\" или \"user_id\"):\n{$res}\n";
