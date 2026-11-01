<?php
header("Content-Type: application/json; charset=utf-8");

// ==================== НАСТРОЙКИ ====================
$telegram_token   = ""; // Токен бота
$telegram_chat_id = "5020976908"; // Chat ID

$mail_to      = "arsenabduramanov30@gmail.com";
$mail_subject = "Новая заявка / Отзыв с сайта";
// =====================================================

// Получаем данные — работает и с обычной формой (POST), и с fetch(JSON)
$raw_input  = file_get_contents("php://input");
$input_data = json_decode($raw_input, true);
if (!is_array($input_data)) {
    $input_data = [];
}

// Honeypot — проверяем СРАЗУ, до любой обработки
$honeypot = $_POST['honeypot'] ?? $input_data['honeypot'] ?? '';
if (!empty($honeypot)) {
    echo json_encode(["status" => "success"]); // делаем вид, что всё ок
    exit;
}

// Тип запроса: 'review' (отзыв) или 'lead' (заявка/звонок)
$type = $_POST['type'] ?? $input_data['type'] ?? null;
if ($type === null) {
    // Автоопределение: если пришёл rating — это отзыв
    $type = (isset($_POST['rating']) || isset($input_data['rating'])) ? 'review' : 'lead';
}

$name   = htmlspecialchars(trim($_POST['name']  ?? $input_data['name']  ?? ''));
$phone  = htmlspecialchars(trim($_POST['phone'] ?? $input_data['phone'] ?? ''));
$text   = htmlspecialchars(trim($_POST['text']  ?? $input_data['text']  ?? $input_data['message'] ?? ''));
$rating = intval($_POST['rating'] ?? $input_data['rating'] ?? 5);
if ($rating < 1 || $rating > 5) {
    $rating = 5;
}

// ==================== ОБРАБОТКА ОТЗЫВА ====================
if ($type === 'review') {
    if ($text === '') {
        echo json_encode(['status' => 'error', 'message' => 'Пустой текст отзыва']);
        exit;
    }

    // Ограничение — один отзыв с одного браузера/устройства
    if (!empty($_COOKIE['t990_reviewed'])) {
        echo json_encode(['status' => 'error', 'message' => 'Вы уже оставляли отзыв. Спасибо!']);
        exit;
    }

    $newReview = [
        'id'     => time(),
        'name'   => $name !== '' ? $name : 'Аноним',
        'text'   => $text,
        'rating' => $rating,
        'date'   => date('d.m.Y'),
        'photo'  => 'photo/client.png'
    ];

    $file = __DIR__ . '/reviews.json';
    $currentReviews = [];

    if (file_exists($file)) {
        $jsonContent = file_get_contents($file);
        $decoded = json_decode($jsonContent, true);
        if (is_array($decoded)) {
            $currentReviews = $decoded;
        }
    }

    array_unshift($currentReviews, $newReview);

    file_put_contents(
        $file,
        json_encode($currentReviews, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
        LOCK_EX
    );

    // Запоминаем на 10 лет, что с этого браузера уже оставили отзыв
    setcookie('t990_reviewed', '1', time() + 315360000, '/');

    $tg_message  = "⭐ <b>Новый отзыв на сайте!</b>\n\n";
    $tg_message .= "<b>Имя:</b> {$newReview['name']}\n";
    $tg_message .= "<b>Оценка:</b> {$rating} ⭐\n";
    $tg_message .= "<b>Отзыв:</b> {$text}\n";

// ==================== ОБРАБОТКА ЗАЯВКИ ====================
} else {
    $tg_message = "🚗 <b>Новая заявка с сайта!</b>\n\n";
    if ($name !== '')  $tg_message .= "<b>Имя:</b> {$name}\n";
    if ($phone !== '') $tg_message .= "<b>Телефон:</b> {$phone}\n";
    if ($text !== '')  $tg_message .= "<b>Сообщение:</b> {$text}\n";
}

$max_token   = "f9LHodD0cOI7Eg87lKsQdl8oisdjX4rjZT94x4GVuOJNM0cYqzMbaTRubZVlkX2bQuyS0HsaBsWOERSS6nul";
$max_chat_id = 910213997239; // ID чата из апдейтов

$ch = curl_init("https://platform-api.max.ru/messages?chat_id={$max_chat_id}");
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => ["Authorization: {$max_token}", "Content-Type: application/json"],
    CURLOPT_POSTFIELDS     => json_encode(["text" => $tg_message, "format" => "html"], JSON_UNESCAPED_UNICODE),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 5,
]);
curl_exec($ch);
curl_close($ch);

// ==================== ОТПРАВКА НА ПОЧТУ (только для заявок) ====================
if ($type !== 'review') {
    $mail_message = "Имя: {$name}\nТелефон: {$phone}\nСообщение: {$text}";
    $mail_headers = "From: {$mail_to}\r\nContent-Type: text/plain; charset=utf-8";
    @mail($mail_to, $mail_subject, $mail_message, $mail_headers);
}

// ==================== ОТВЕТ ДЛЯ JS ====================
echo json_encode(["status" => "success"]);
